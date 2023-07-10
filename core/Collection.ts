import { Route } from './_handler.ts'
import { base, Method, METHODS } from './_base.ts'

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
    Method,
    string,
    Route[],
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
    super()

    this.routes = []

    this.#cache = cache
    this.#cors = cors

    for (let i = 0; i < METHODS.length; i++) {
      // @ts-ignore:
      super[METHODS[i]] = (pathname, ...handler) => {
        if ((this.#cache || this.#cors) && typeof handler[0] !== 'function') {
          if (handler[0].cache === undefined && this.#cache !== undefined) {
            handler[0].cache = this.#cache
          }

          if (!handler[0].cors) {
            handler[0].cors = this.#cors
          }
        }

        this.routes.push([METHODS[i], pathname, handler])

        return this
      }
    }
  }
}
