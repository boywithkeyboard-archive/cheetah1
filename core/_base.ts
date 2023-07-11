import { bodylessHandler, handler, Route } from './_handler.ts'

export type Method =
  | 'delete'
  | 'get'
  | 'head'
  | 'patch'
  | 'post'
  | 'put'

export const METHODS: Method[] = [
  'delete',
  'get',
  'head',
  'patch',
  'post',
  'put',
]

export function base<T>(): {
  new (
    addRoute: (
      method: Uppercase<Method>,
      pathname: string,
      handlers: Route[],
    ) => unknown,
  ):
    & {
      [
        M in (
          | 'delete'
          | 'patch'
          | 'post'
          | 'put'
        )
      ]: ReturnType<typeof handler<T>>
    }
    & {
      [
        M in (
          | 'get'
          | 'head'
        )
      ]: ReturnType<typeof bodylessHandler<T>>
    }
} {
  return class {
    #a

    constructor(
      addRoute: (
        method: Uppercase<Method>,
        pathname: string,
        handlers: Route[],
      ) => unknown,
    ) {
      this.#a = addRoute
    }

    delete(pathname: string, ...handlers: Route[]) {
      return this.#a('DELETE', pathname, handlers)
    }

    get(pathname: string, ...handlers: Route[]) {
      return this.#a('GET', pathname, handlers)
    }

    patch(pathname: string, ...handlers: Route[]) {
      return this.#a('PATCH', pathname, handlers)
    }

    post(pathname: string, ...handlers: Route[]) {
      return this.#a('POST', pathname, handlers)
    }

    put(pathname: string, ...handlers: Route[]) {
      return this.#a('PUT', pathname, handlers)
    }
  } as never
}
