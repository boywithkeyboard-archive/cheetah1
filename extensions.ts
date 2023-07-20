// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { AppContext, Context } from './mod.ts'

type HasRequired<T> = Partial<T> extends T ? false : true

type Req = Response | void | undefined
type Res = void | undefined

export type Extension<
  Config extends Record<string, unknown> | unknown = never,
> = {
  __config: Config | undefined
  onRequest?: HasRequired<Config> extends true ? ((context: {
      app: AppContext
      req: Request
      _: Config
    }) => Req | Promise<Req>)
    : ((context: {
      app: AppContext
      req: Request
      _?: Config
    }) => Req | Promise<Req>)
  onResponse?: HasRequired<Config> extends true ? ((context: {
      app: AppContext
      c: Context
      _: Config
    }) => Res | Promise<Res>)
    : ((context: {
      app: AppContext
      c: Context
      _?: Config
    }) => Res | Promise<Res>)
}

type ReturnFunction<
  Config extends Record<string, unknown> | unknown = unknown,
> = Config extends Record<string, unknown>
  ? (HasRequired<Config> extends true ? ((config: Config) => Extension<Config>)
    : ((config?: Config) => Extension<Config>))
  : (() => Extension<Config>)

export function validExtension(ext: Record<string, unknown>) {
  const symbol = Object.getOwnPropertySymbols(ext).find((s) =>
    s.description === 'cheetah.extension'
  )

  // @ts-ignore:
  return symbol !== undefined && ext[symbol] === 'v1.0'
}

export function createExtension<
  Config extends Record<string, unknown> | unknown = unknown,
>({
  onRequest,
  onResponse,
}: {
  onRequest?: Extension<Config>['onRequest']
  onResponse?: Extension<Config>['onResponse']
}) {
  return ((__config?: Config) => {
    return {
      __config,
      onRequest,
      onResponse,
      [Symbol('cheetah.extension')]: 'v1.0',
    }
  }) as ReturnFunction<Config>
}
