// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { base, Method } from './base.ts'
import { HandlerOrSchema } from './handler.ts'

export class Collection extends base<Collection>() {
  #cors:
    | string
    | undefined

  routes: [
    Uppercase<Method>,
    string,
    HandlerOrSchema[],
  ][]

  constructor({
    cors,
  }: {
    /**
     * Enable Cross-Origin Resource Sharing (CORS) for this collection by setting a origin, e.g. `*`.
     *
     * @since v0.11
     */
    cors?: string
  } = {}) {
    super((method, pathname, handlers) => {
      if (this.#cors && typeof handlers[0] !== 'function') {
        if (!handlers[0].cors) {
          handlers[0].cors = this.#cors
        }
      }

      this.routes.push([method, pathname, handlers])

      return this
    })

    this.#cors = cors
    this.routes = []
  }
}
