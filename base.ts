// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { bodylessHandler, handler, HandlerOrSchema } from './handler.ts'

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
      handlers: HandlerOrSchema[],
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
        handlers: HandlerOrSchema[],
      ) => unknown,
    ) {
      this.#a = addRoute
    }

    delete(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('DELETE', pathname, handlers)
    }

    get(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('GET', pathname, handlers)
    }

    head(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('HEAD', pathname, handlers)
    }

    patch(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('PATCH', pathname, handlers)
    }

    post(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('POST', pathname, handlers)
    }

    put(pathname: string, ...handlers: HandlerOrSchema[]) {
      return this.#a('PUT', pathname, handlers)
    }
  } as never
}
