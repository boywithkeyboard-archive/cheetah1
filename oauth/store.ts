import { Redis } from 'https://deno.land/x/upstash_redis@v1.22.0/mod.ts'
import { Context } from '../context.ts'
import { env } from '../x/env.ts'
import { SessionData } from './types.ts'

export class OAuthStore {
  set: (
    c: Context,
    key: string,
    value: SessionData,
    maxAge: number,
  ) => Promise<void>
  get: (c: Context, key: string) => Promise<SessionData | undefined>
  delete: (c: Context, key: string) => Promise<void>

  constructor(
    options: {
      set: (
        c: Context,
        key: string,
        value: SessionData,
        maxAge: number,
      ) => Promise<void>
      get: (c: Context, key: string) => Promise<SessionData | undefined>
      delete: (c: Context, key: string) => Promise<void>
    },
  ) {
    this.set = options.set
    this.get = options.get
    this.delete = options.delete
  }
}

let KV: Deno.Kv | undefined

/**
 * @since v1.3
 */
export const native = new OAuthStore({
  async set(_c, key, value, _maxAge) {
    if (!KV) {
      KV = await Deno.openKv('oauth')
    }

    await KV.set([key], value)
  },

  async get(_c, key) {
    if (!KV) {
      KV = await Deno.openKv('oauth')
    }

    const result = await KV.get<SessionData>([key], { consistency: 'strong' })

    return result.value ?? undefined
  },

  async delete(_c, key) {
    if (!KV) {
      KV = await Deno.openKv('oauth')
    }

    await KV.delete([key])
  },
})

let REDIS: Redis | undefined

/**
 * @since v1.3
 */
export const upstash = new OAuthStore({
  async set(c, key, value, maxAge) {
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
      ex: maxAge,
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
