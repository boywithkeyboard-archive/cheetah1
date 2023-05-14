import { Route } from './Handler.d.ts'
import { Validator } from './validator/Validator.d.ts'

export class Router<V extends Validator | undefined> {
  #routes: [string, RegExp, Route<V>[]][] = []

  add(method: string, pathname: string, handler: Route<V>[]) {
    this.#routes.push([method, RegExp(`^${pathname
      .replace(/(\/?)\*/g, '($1.*)?')
      .replace(/(\/$)|((?<=\/)\/)/, '')
      .replace(/(:(\w+)\+)/, '(?<$2>.*)')
      .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
      .replace(/\.(?=[\w(])/, '\\.')
      //.replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.')
    }/*$`), handler])
  }

  match(method: string, pathname: string) {
    for (let i = 0; i < this.#routes.length; ++i) {
      if (method !== 'OPTIONS' && this.#routes[i][0] !== method)
        continue

      const matches = pathname.match(this.#routes[i][1])

      if (matches === null)
        continue

      return {
        handlers: this.#routes[i][2],
        params: matches.groups ?? {}
      }
    }

    return null
  }
}
