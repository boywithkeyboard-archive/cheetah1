import { Method } from './_base.ts'
import { Route } from './_handler.ts'

export class Router {
  #r: [Uppercase<Method>, URLPattern, Route[]][] = []

  add(method: Uppercase<Method>, pathname: string, handler: Route[]) {
    this.#r.push([
      method,
      new URLPattern({ pathname }),
      handler,
    ])
  }

  match(method: string, pathname: string, preflight: boolean) {
    for (let i = 0; i < this.#r.length; ++i) {
      if (
        method === this.#r[i][0] ||
        method === 'OPTIONS' ||
        preflight && method === 'HEAD' && this.#r[i][0] === 'GET'
      ) {
        const result = this.#r[i][1].exec({ pathname })

        if (!result) {
          continue
        }

        return {
          handlers: this.#r[i][2],
          params: result.pathname.groups,
        }
      }
    }

    return null
  }
}
