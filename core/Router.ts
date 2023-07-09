import { Route } from './_.ts'

export class Router {
  #routes: [string, RegExp, Route[]][] = []

  add(method: string, pathname: string, handler: Route[]) {
    this.#routes.push([
      method,
      RegExp(`^${pathname
          .replace(/(\/?)\*/g, '($1.*)?')
          .replace(/(\/$)|((?<=\/)\/)/, '')
          .replace(/(:(\w+)\+)/, '(?<$2>.*)')
          .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
          .replace(/\.(?=[\w(])/, '\\.')
        //.replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.')
      }/*$`),
      handler,
    ])
  }

  match(method: string, pathname: string, preflight: boolean) {
    for (let i = 0; i < this.#routes.length; ++i) {
      if (
        method === this.#routes[i][0] ||
        method === 'OPTIONS' ||
        preflight && method === 'HEAD' && this.#routes[i][0] === 'GET'
      ) {
        const matches = pathname.match(this.#routes[i][1])

        if (!matches) {
          continue
        }

        return {
          handlers: this.#routes[i][2],
          params: matches.groups ?? {},
        }
      }
    }

    return null
  }
}
