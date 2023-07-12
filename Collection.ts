// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { base, Method } from './base.ts'
import { HandlerOrSchema } from './handler.ts'

export class Collection extends base<Collection>() {
  #cache:
    | false
    | {
      maxAge: number
    }
    | undefined

  #cors:
    | string
    | undefined

  routes: [
    Uppercase<Method>,
    string,
    HandlerOrSchema[],
  ][]

  constructor({
    cache,
    cors,
  }: {
    /**
     * Duration in seconds for how long a response should be cached.
     *
     * @since v0.11
     */
    cache?:
      | false
      | {
        maxAge: number
      }
    /**
     * Enable Cross-Origin Resource Sharing (CORS) for this collection by setting a origin, e.g. `*`.
     *
     * @since v0.11
     */
    cors?: string
  } = {}) {
    super((method, pathname, handlers) => {
      if ((this.#cache || this.#cors) && typeof handlers[0] !== 'function') {
        if (handlers[0].cache === undefined && this.#cache !== undefined) {
          handlers[0].cache = this.#cache
        }

        if (!handlers[0].cors) {
          handlers[0].cors = this.#cors
        }
      }

      this.routes.push([method, pathname, handlers])

      return this
    })

    this.routes = []

    this.#cache = cache
    this.#cors = cors
  }
}
