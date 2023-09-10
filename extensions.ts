// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { ZodString, ZodUnion } from 'zod'
import { Method } from './base.ts'
import { Handler, ObjectType } from './handler.ts'
import { AppContext, Context } from './mod.ts'

type HasRequired<T> = Partial<T> extends T ? false : true

type Req = Response | void | undefined
type Res = void | undefined

type ExtensionContext = {
  /** The prefix of the routes to which this extension is assigned. */
  prefix: string
}

export type Extension<
  Config extends Record<string, unknown> | unknown = never,
> = {
  __config: Config | undefined
  onPlugIn: HasRequired<Config> extends true ? ((
      context: ExtensionContext & {
        env: AppContext['env']
        routes: AppContext['routes']
        runtime: AppContext['runtime']
        setRoute: <
          Pathname extends `/${string}`,
          // deno-lint-ignore no-explicit-any
          ValidatedBody extends ObjectType | ZodString | ZodUnion<any>,
          ValidatedCookies extends ObjectType,
          ValidatedHeaders extends ObjectType,
          ValidatedQuery extends ObjectType,
        >(
          method: Method,
          pathname: Pathname,
          ...handler: (
            | {
              body?: ValidatedBody
              cookies?: ValidatedCookies
              headers?: ValidatedHeaders
              query?: ValidatedQuery
              cors?: string
            }
            | Handler<
              Pathname,
              ValidatedBody,
              ValidatedCookies,
              ValidatedHeaders,
              ValidatedQuery
            >
          )[]
        ) => void | Promise<void>
        settings: Config
      },
    ) => void | Promise<void>)
    : ((
      context: ExtensionContext & {
        env: AppContext['env']
        routes: AppContext['routes']
        runtime: AppContext['runtime']
        setRoute: <
          Pathname extends `/${string}`,
          // deno-lint-ignore no-explicit-any
          ValidatedBody extends ObjectType | ZodString | ZodUnion<any>,
          ValidatedCookies extends ObjectType,
          ValidatedHeaders extends ObjectType,
          ValidatedQuery extends ObjectType,
        >(
          method: Method,
          pathname: Pathname,
          ...handlers: (
            | {
              body?: ValidatedBody
              cookies?: ValidatedCookies
              headers?: ValidatedHeaders
              query?: ValidatedQuery
              cors?: string
            }
            | Handler<
              Pathname,
              ValidatedBody,
              ValidatedCookies,
              ValidatedHeaders,
              ValidatedQuery
            >
          )[]
        ) => void
        settings?: Config
      },
    ) => void | Promise<void>)
  onRequest?: HasRequired<Config> extends true ? ((
      context: ExtensionContext & {
        app: AppContext
        req: Request
        _: Config
      },
    ) => Req | Promise<Req>)
    : ((
      context: ExtensionContext & {
        app: AppContext
        req: Request
        _?: Config
      },
    ) => Req | Promise<Req>)
  onResponse?: HasRequired<Config> extends true ? ((
      context: ExtensionContext & {
        app: AppContext
        c: Context
        _: Config
      },
    ) => Res | Promise<Res>)
    : ((
      context: ExtensionContext & {
        app: AppContext
        c: Context
        _?: Config
      },
    ) => Res | Promise<Res>)
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
  onPlugIn,
  onRequest,
  onResponse,
}: {
  onPlugIn?: Extension<Config>['onPlugIn']
  onRequest?: Extension<Config>['onRequest']
  onResponse?: Extension<Config>['onResponse']
}) {
  return ((__config?: Config) => {
    return {
      __config,
      onPlugIn,
      onRequest,
      onResponse,
      [Symbol('cheetah.extension')]: 'v1.0',
    }
  }) as ReturnFunction<Config>
}
