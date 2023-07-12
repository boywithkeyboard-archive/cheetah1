// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from './mod.ts'

type HasRequired<T> = Partial<T> extends T ? false : true

export type Extension<
  Config extends Record<string, unknown> | unknown = unknown,
> = {
  __config: Config | undefined
  onRequest?: HasRequired<Config> extends true ? ((
      req: Request,
      config: Config,
    ) => Response | void | Promise<Response> | Promise<void>)
    : ((
      req: Request,
      config?: Config,
    ) => Response | void | Promise<Response> | Promise<void>)
  onResponse?: HasRequired<Config> extends true
    ? ((c: Context, config: Config) => Promise<void> | void)
    : ((c: Context, config?: Config) => Promise<void> | void)
}

type ReturnFunction<
  Config extends Record<string, unknown> | unknown = unknown,
> = Config extends unknown ? (() => Extension<Config>)
  : HasRequired<Config> extends true ? ((config: Config) => Extension<Config>)
  : ((config?: Config) => Extension<Config>)

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
