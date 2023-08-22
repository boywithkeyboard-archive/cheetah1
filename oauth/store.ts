// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { KVNamespace } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230821.0/index.ts'
import { Redis } from 'https://deno.land/x/upstash_redis@v1.22.0/mod.ts'
import { Context } from '../context.ts'
import { env } from '../x/env.ts'
import { OAuthSessionData } from './types.ts'

export class OAuthStore {
  set: (
    c: Context,
    key: string,
    value: OAuthSessionData,
    expiresAt: number, // unix timestamp in ms
  ) => Promise<void>
  get: (c: Context, key: string) => Promise<OAuthSessionData | undefined>
  delete: (c: Context, key: string) => Promise<void>
  has: (c: Context, key: string) => Promise<boolean>

  constructor(
    options: {
      set: OAuthStore['set']
      get: OAuthStore['get']
      delete: OAuthStore['delete']
      has: OAuthStore['has']
    },
  ) {
    this.set = options.set
    this.get = options.get
    this.delete = options.delete
    this.has = options.has
  }
}

let KV: Deno.Kv | undefined

/**
 * Use [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv) or [Deno KV](https://deno.com/kv) as session storage, depending on the runtime.
 *
 * @namespace oauth
 * @since v1.3
 */
export const kv = new OAuthStore({
  async set(c, key, value, expiresAt) {
    if (c.runtime === 'cloudflare') {
      await (c.__app.env as { oauth: KVNamespace }).oauth.put(
        key,
        JSON.stringify(value),
        { expiration: Math.round(expiresAt / 1000) },
      )
    } else {
      if (!KV) {
        KV = await Deno.openKv('oauth')
      }

      await KV.set([key], value)
    }
  },

  async get(c, key) {
    if (c.runtime === 'cloudflare') {
      const kv = (c.__app.env as { oauth: KVNamespace }).oauth

      const value = await kv.get<OAuthSessionData>(key, 'json')

      if (value === null || value.expiresAt < Date.now()) {
        return
      }

      return value
    } else {
      if (!KV) {
        KV = await Deno.openKv('oauth')
      }

      const result = await KV.get<OAuthSessionData>([key], {
        consistency: 'strong',
      })

      if (result.value === null) {
        return
      }

      if (result.value.expiresAt > Date.now()) {
        return result.value
      }

      await KV.delete([key])
    }
  },

  async has(c, key) {
    if (c.runtime === 'cloudflare') {
      const kv = (c.__app.env as { oauth: KVNamespace }).oauth

      const value = await kv.get<OAuthSessionData>(key, 'json')

      if (value === null) {
        return false
      }

      return value.expiresAt > Date.now()
    } else {
      if (!KV) {
        KV = await Deno.openKv('oauth')
      }

      const result = await KV.get<OAuthSessionData>([key], {
        consistency: 'strong',
      })

      if (result.value === null) {
        return false
      }

      if (result.value.expiresAt > Date.now()) {
        return true
      }

      await KV.delete([key])

      return false
    }
  },

  async delete(c, key) {
    if (c.runtime === 'cloudflare') {
      const kv = (c.__app.env as { oauth: KVNamespace }).oauth

      await kv.delete(key)
    } else {
      if (!KV) {
        KV = await Deno.openKv('oauth')
      }

      await KV.delete([key])
    }
  },
})

let REDIS: Redis | undefined

/**
 * Use [Upstash](https://upstash.com) as session storage.
 *
 * @namespace oauth
 * @since v1.3
 */
export const upstash = new OAuthStore({
  async set(c, key, value, expiresAt) {
    if (!REDIS) {
      const e = env<{
        upstashUrl?: string
        upstash_url?: string
        UPSTASH_URL?: string
        upstashToken?: string
        upstash_token?: string
        UPSTASH_TOKEN?: string
      }>(c)

      REDIS = new Redis({
        url: e.upstashUrl ?? e.upstash_url ?? e.UPSTASH_URL as string,
        token: e.upstashToken ?? e.upstash_token ?? e.UPSTASH_TOKEN as string,
      })
    }

    await REDIS.set(key, value, {
      pxat: expiresAt,
    })
  },

  async get(c, key) {
    if (!REDIS) {
      const e = env<{
        upstashUrl?: string
        upstash_url?: string
        UPSTASH_URL?: string
        upstashToken?: string
        upstash_token?: string
        UPSTASH_TOKEN?: string
      }>(c)

      REDIS = new Redis({
        url: e.upstashUrl ?? e.upstash_url ?? e.UPSTASH_URL as string,
        token: e.upstashToken ?? e.upstash_token ?? e.UPSTASH_TOKEN as string,
      })
    }

    return await REDIS.get(key) ?? undefined
  },

  async has(c, key) {
    if (!REDIS) {
      const e = env<{
        upstashUrl?: string
        upstash_url?: string
        UPSTASH_URL?: string
        upstashToken?: string
        upstash_token?: string
        UPSTASH_TOKEN?: string
      }>(c)

      REDIS = new Redis({
        url: e.upstashUrl ?? e.upstash_url ?? e.UPSTASH_URL as string,
        token: e.upstashToken ?? e.upstash_token ?? e.UPSTASH_TOKEN as string,
      })
    }

    return await REDIS.exists(key) === 1
  },

  async delete(c, key) {
    if (!REDIS) {
      const e = env<{
        upstashUrl?: string
        upstash_url?: string
        UPSTASH_URL?: string
        upstashToken?: string
        upstash_token?: string
        UPSTASH_TOKEN?: string
      }>(c)

      REDIS = new Redis({
        url: e.upstashUrl ?? e.upstash_url ?? e.UPSTASH_URL as string,
        token: e.upstashToken ?? e.upstash_token ?? e.UPSTASH_TOKEN as string,
      })
    }

    await REDIS.del(key)
  },
})
