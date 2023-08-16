// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { encode } from 'https://deno.land/std@0.198.0/encoding/base64.ts'
import { Context } from './context.ts'

export class Store {
  #cache: globalThis.Cache | null
  #context
  #maxAge
  #name

  constructor(c: Context, {
    maxAge = 600,
    name = 'cheetah',
  }: {
    /**
     * Duration in seconds for how long a response should be cached.
     *
     * @default 600
     */
    maxAge?: number
    /** A unique name for your cache. */
    name?: string
  } = {}) {
    this.#cache = null
    this.#context = c
    this.#maxAge = maxAge
    this.#name = name
  }

  async set(key: string, data: string | Record<string, unknown> | Uint8Array) {
    if (this.#cache === null) {
      this.#cache = await caches.open(this.#name)
    }

    this.#context.waitUntil(
      this.#cache.put(
        `https://${this.#name}.com/${encode(key)}`,
        new Response(
          typeof data === 'string' || data instanceof Uint8Array
            ? data
            : JSON.stringify(data),
          {
            headers: {
              'cache-control': `max-age=${this.#maxAge}`,
            },
          },
        ),
      ),
    )
  }

  get<T extends Record<string, unknown> = Record<string, unknown>>(
    key: string,
    type: 'json',
  ): Promise<T | undefined>
  get<T extends string = string>(
    key: string,
    type: 'string',
  ): Promise<T | undefined>
  get<T extends Uint8Array = Uint8Array>(
    key: string,
    type: 'buffer',
  ): Promise<T | undefined>

  async get<T extends Record<string, unknown> | string | Uint8Array>(
    key: string,
    type: 'string' | 'json' | 'buffer' = 'string',
  ): Promise<T | undefined> {
    if (this.#cache === null) {
      this.#cache = await caches.open(this.#name)
    }

    try {
      const result = await this.#cache.match(
        `https://${this.#name}.com/${encode(key)}`,
      )

      if (!result) {
        return undefined
      }

      const data = type === 'string'
        ? await result.text()
        : type === 'json'
        ? await result.json()
        : new Uint8Array(await result.arrayBuffer())

      return data
    } catch (_err) {
      return undefined
    }
  }

  async has(key: string) {
    if (this.#cache === null) {
      this.#cache = await caches.open(this.#name)
    }

    const result = await this.#cache.match(
      `https://${this.#name}.com/${encode(key)}`,
    )

    return result !== undefined
  }

  async delete(key: string) {
    if (this.#cache === null) {
      this.#cache = await caches.open(this.#name)
    }

    return await this.#cache.delete(
      `https://${this.#name}.com/${encode(key)}`,
    )
  }
}
