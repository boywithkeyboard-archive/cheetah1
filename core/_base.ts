import { bodylessHandler, handler } from './_handler.ts'

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
  new ():
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
  return class {} as never
}
