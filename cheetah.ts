// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { base, Method } from './base.ts'
import { Collection } from './collection.ts'
import { Context, Exception } from './context.ts'
import { Exception as OriginalException } from './exception.ts'
import { Extension, validExtension } from './extensions.ts'
import {
  Handler,
  HandlerOrSchema,
  Payload,
  Version,
  VersionRange,
} from './handler.ts'
import { OAuthStore } from './oauth/mod.ts'
import { OAuthSessionData } from './oauth/types.ts'
import { ResponseContext } from './response_context.ts'

export type AppContext = {
  debugging: boolean
  gateway?: number
  env: Record<string, unknown> | undefined
  ip: string
  proxy: AppConfig['proxy']
  routes: cheetah['routes']
  runtime:
    | 'cloudflare'
    | 'deno'
  request: {
    pathname: string
    querystring?: string
  }
  oauth: AppConfig['oauth']
  versioning: AppConfig['versioning']
  caching: AppConfig['cache']
}

export type AppConfig = {
  /**
   * A prefix for all routes, e.g. `/api`.
   *
   * @default '/'
   */
  base?: `/${string}`

  /**
   * Enable Cross-Origin Resource Sharing (CORS) for your app by setting a origin, e.g. `*`.
   */
  cors?: string

  /**
   * If enabled, cheetah will attempt to find the matching `.get()` handler for an incoming HEAD request. Your existing `.head()` handlers won't be impacted.
   *
   * @default false
   * @since v0.11
   */
  preflight?: boolean

  /**
   * If you're using Cloudflare as a proxy, you should confirm it with this setting in order to unleash the full potential of cheetah.
   *
   * @default undefined
   */
  proxy?: 'cloudflare'

  /**
   * Set a custom error handler.
   */
  error?: (error: unknown, request: Request) => Response | Promise<Response>

  /**
   * Set a custom 404 handler.
   */
  notFound?: (request: Request) => Response | Promise<Response>

  oauth?: {
    store: OAuthStore
    cookie?: Parameters<ResponseContext['setCookie']>[2]
    onSignIn?: (
      c: Context,
      data: OAuthSessionData,
    ) => Promise<unknown> | unknown
    onSignOut?: (
      c: Context,
      identifier: string,
    ) => Promise<unknown> | unknown
  }

  /**
   * If you enable debug mode, all errors will get logged to the console.
   *
   * @since v1.3
   */
  debug?: boolean

  versioning?:
    & (
      | {
        type: 'uri'
      }
      | {
        type: 'header'
        header: string
      }
    )
    & {
      current: Version
    }

  cache?: {
    /** A unique name for your cache. */
    name: string
  }
}

export class cheetah extends base<cheetah>() {
  #base
  #cors
  #error
  #extensions: Set<[string, Extension]>
  #notFound
  #preflight
  #proxy
  #routes: Set<[Uppercase<Method>, string, RegExp, HandlerOrSchema[]]>
  #runtime: 'deno' | 'cloudflare'
  #onPlugIn
  #oauth
  #debug
  #versioning
  #cache

  constructor({
    base,
    cors,
    preflight = false,
    proxy,
    error,
    notFound,
    oauth,
    debug = false,
    versioning,
    cache,
  }: AppConfig = {}) {
    super((method, pathname, handlers) => {
      pathname = this.#base ? this.#base + pathname : pathname

      this.#routes.add([
        method,
        pathname,
        RegExp(`^${
          (pathname
            .replace(/\/+(\/|$)/g, '$1'))
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')
            .replace(/\./g, '\\.')
            .replace(/(\/?)\*/g, '($1.*)?')
        }/*$`),
        handlers,
      ])

      return this
    })

    this.#base = base === '/' ? undefined : base
    this.#cors = cors
    this.#error = error
    this.#extensions = new Set()
    this.#notFound = notFound
    this.#preflight = preflight
    this.#proxy = proxy
    this.#routes = new Set()
    this.#runtime = typeof globalThis?.Deno?.serve !== 'function'
      ? 'cloudflare'
      : 'deno'
    this.#onPlugIn = false
    this.#oauth = oauth
    this.#debug = debug
    this.#versioning = versioning
    this.#cache = cache
  }

  /* use ---------------------------------------------------------------------- */

  // deno-lint-ignore no-explicit-any
  use<C extends Collection>(...extensions: Extension<any>[]): this
  use<C extends Collection>(
    prefix: `/${string}`,
    // deno-lint-ignore no-explicit-any
    ...extensions: Extension<any>[]
  ): this
  use<C extends Collection>(
    prefix: `/${string}`,
    collection: C,
    // deno-lint-ignore no-explicit-any
    ...extensions: Extension<any>[]
  ): this

  use<C extends Collection>(
    // deno-lint-ignore no-explicit-any
    ...elements: (`/${string}` | C | Extension<any>)[]
  ) {
    let pre

    for (const e of elements) {
      if (typeof e === 'string') { // prefix
        pre = e
      } else if (e instanceof Collection) { // collection
        if (!pre || pre === '/') {
          pre = ''
        }

        for (const r of e.routes.values()) {
          let pathname = r[1]

          if (pathname === '/') {
            pathname = ''
          }

          pathname = this.#base ? this.#base + pre + pathname : pre + pathname

          this.#routes.add([
            r[0],
            pathname,
            RegExp(
              `^${
                (pathname
                  .replace(/\/+(\/|$)/g, '$1'))
                  .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')
                  .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')
                  .replace(/\./g, '\\.')
                  .replace(/(\/?)\*/g, '($1.*)?')
              }/*$`,
            ),
            r[2],
          ])
        }
      } else if (validExtension(e)) { // extension
        if (!pre) {
          pre = '*'
        }

        // @ts-ignore:
        this.#extensions.add([pre, e])
      }
    }

    return this
  }

  get routes() {
    return this.#routes
  }

  /* router ------------------------------------------------------------------- */

  #parseVersion(headers: Headers, pathname: string) {
    if (!this.#versioning) { // for typescript
      throw new Error('Versioning not configured!')
    }

    const regex = /^v[1-9][0-9]?$|^100$/

    if (this.#versioning.type === 'uri') {
      const arr = pathname.replace('/', '').split('/')

      if (regex.test(arr[0])) {
        const version = arr[0]

        arr.shift()

        return { version, pathname: '/' + arr.join('/') }
      }

      return { version: this.#versioning.current, pathname }
    }

    const header = headers.get(this.#versioning.header)

    if (
      this.#versioning.type === 'header' && header !== null &&
      regex.test(header)
    ) {
      return { version: header, pathname }
    }

    return { version: this.#versioning.current, pathname }
  }

  #match(request: Request, p: string) {
    for (const r of this.#routes.values()) {
      if (
        request.method === r[0] ||
        request.method === 'OPTIONS' ||
        this.#preflight && request.method === 'HEAD' && r[0] === 'GET'
      ) {
        if (this.#versioning) {
          const { pathname, version } = this.#parseVersion(request.headers, p)

          if (
            parseInt(version.replace('v', '')) >
              parseInt(this.#versioning.current.replace('v', ''))
          ) {
            break
          }

          const options = typeof r[3][0] !== 'function' ? r[3][0] : null

          if (options?.gateway !== undefined) {
            const result = pathname.match(r[2])

            if (!result) {
              continue
            }

            const gateway = isVersionWithinRange(
              version as Version,
              options.gateway as VersionRange,
            )

            if (!gateway) {
              break
            }

            return {
              handlers: r[3],
              params: result.groups ?? {},
              gateway,
            }
          } else {
            const result = pathname.match(r[2])

            if (!result) {
              continue
            }

            return {
              handlers: r[3],
              params: result.groups ?? {},
              gateway: parseInt(version.replace('v', '')),
            }
          }
        } else {
          const result = p.match(r[2])

          if (!result) {
            continue
          }

          return {
            handlers: r[3],
            params: result.groups ?? {},
            gateway: undefined,
          }
        }
      }
    }

    return null
  }

  /* fetch -------------------------------------------------------------------- */

  fetch = async (
    req: Request,
    data: Record<string, unknown> | Deno.ServeHandlerInfo = {},
    context?: {
      waitUntil: (promise: Promise<unknown>) => void
    },
  ): Promise<Response> => {
    try {
      const ip = data?.remoteAddr && this.#runtime === 'deno'
        ? (data as Deno.ServeHandlerInfo).remoteAddr
          .hostname
        : req.headers.get('cf-connecting-ip') as string

      const parts = req.url.split('?')

      parts[0] = parts[0].slice(8)

      const __app: AppContext = {
        env: data as Record<string, unknown>,
        ip,
        proxy: this.#proxy,
        request: {
          pathname: parts[0].substring(parts[0].indexOf('/')),
          querystring: parts[1],
        },
        routes: this.#routes,
        runtime: this.#runtime,
        oauth: this.#oauth,
        versioning: this.#versioning,
        gateway: -1,
        debugging: this.#debug,
        caching: this.#cache,
      }

      if (this.#extensions.size > 0) {
        let body: Response | void = undefined

        for (const e of this.#extensions.values()) {
          if (!this.#onPlugIn && e[1].onPlugIn !== undefined) {
            await e[1].onPlugIn({
              prefix: e[0],
              env: __app.env,
              routes: this.#routes,
              runtime: this.#runtime,
              setRoute: (method, pathname, ...handlers) => {
                this.#routes.add([
                  method.toUpperCase() as Uppercase<Method>,
                  pathname,
                  RegExp(
                    `^${
                      (pathname
                        .replace(/\/+(\/|$)/g, '$1'))
                        .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')
                        .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')
                        .replace(/\./g, '\\.')
                        .replace(/(\/?)\*/g, '($1.*)?')
                    }/*$`,
                  ),
                  // @ts-ignore:
                  handlers,
                ])
              },
            })
          }

          if (
            e[0] !== '*' &&
            __app.request.pathname.indexOf(e[0]) !== 0
          ) {
            continue
          }

          if (e[1].onRequest !== undefined) {
            const result = await e[1].onRequest({
              prefix: e[0],
              app: __app,
              req,
              _: e[1].__config,
            })

            if (result !== undefined) {
              body = result
            }
          }
        }

        if (!this.#onPlugIn) {
          this.#onPlugIn = true
        }

        if (body !== undefined) {
          return body
        }
      }

      const route = this.#match(
        req,
        __app.request.pathname,
      )

      __app.gateway = route?.gateway ?? -1

      if (!route) {
        if (!this.#notFound) {
          throw new Exception('Not Found', undefined, 404)
        }

        if (req.method !== 'HEAD') {
          return await this.#notFound(req)
        }

        const response = await this.#notFound(req)

        return new Response(null, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      }

      const response = await this.#handle(
        __app,
        req,
        context?.waitUntil ??
          ((promise: Promise<unknown>) => {
            // deno-fmt-ignore-line
            (async () => await promise)()
          }),
        route.params,
        route.handlers,
      )

      if (req.method === 'HEAD') {
        return new Response(null, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      }

      return response
    } catch (err) {
      let res: Response

      if (err instanceof Exception || err instanceof OriginalException) {
        res = err.response(req)
      } else {
        if (this.#debug) {
          console.error(err)
        }

        if (this.#error) {
          res = await this.#error(err, req)
        } else {
          res = new Exception('Something Went Wrong', undefined, 500).response(
            req,
          )
        }
      }

      if (req.method === 'HEAD') {
        return new Response(null, {
          headers: res.headers,
          status: res.status,
          statusText: res.statusText,
        })
      }

      return res
    }
  }

  /* handle ------------------------------------------------------------------- */

  async #handle(
    __app: AppContext,
    r: Request,
    waitUntil: (promise: Promise<unknown>) => void,
    p: Record<string, string | undefined>,
    handlers: HandlerOrSchema[],
  ) {
    const o = typeof handlers[0] !== 'function' ? handlers[0] : null

    // preflight cors request

    if (
      r.method === 'OPTIONS' &&
      r.headers.has('origin') &&
      r.headers.has('access-control-request-method')
    ) {
      return new Response(null, {
        status: 204,
        headers: {
          ...((this.#cors || o?.cors) &&
            { 'access-control-allow-origin': o?.cors ?? this.#cors }),
          'access-control-allow-methods': '*',
          'access-control-allow-headers':
            r.headers.get('access-control-request-headers') ?? '*',
          'access-control-allow-credentials': 'false',
          'access-control-max-age': '600',
        },
      })
    }

    // construct context

    const $: {
      b: Exclude<Payload, void> | null
      c: number
      h: Headers
    } = {
      b: null,
      c: 200,
      h: new Headers({
        ...(this.#cors && {
          'access-control-allow-origin': this.#cors,
        }),
      }),
    }

    const context = new Context(
      __app,
      $,
      p,
      r,
      o,
      waitUntil,
    )

    // handle request

    const len = handlers.length

    let next = true

    for (let i = 0; i < len; ++i) {
      if (typeof handlers[i] !== 'function') {
        continue
      }

      if (!next) {
        break
      }

      next = false

      const result = await (handlers[i] as Handler<unknown>)(
        context,
        () => {
          next = true
        },
      )

      if (result) {
        $.b = result
      }
    }

    // construct response

    if ($.c.toString().indexOf('3') === 0) {
      return new Response(null, {
        headers: $.h,
        status: $.c,
      })
    }

    if (!$.b) {
      return new Response(null, {
        headers: $.h,
        status: $.c,
      })
    }

    for (const e of this.#extensions.values()) {
      if (
        e[0] !== '*' &&
        __app.request.pathname.indexOf(e[0]) !== 0
      ) {
        continue
      }

      const { onResponse } = e[1]

      if (onResponse !== undefined) {
        onResponse({
          prefix: e[0],
          app: __app,
          c: context,
          _: e[1].__config,
        })
      }
    }

    switch ($.b.constructor.name) {
      case 'String': {
        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'text/plain; charset=utf-8')
        }

        break
      }

      case 'Object': {
        $.b = JSON.stringify($.b)

        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'application/json; charset=utf-8')
        }

        if ((($.b as unknown) as { code: number }).code) {
          $.c = (($.b as unknown) as { code: number }).code
        }

        break
      }

      case 'Array': {
        $.b = JSON.stringify($.b)

        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'application/json; charset=utf-8')
        }

        break
      }

      default:
        break
    }

    return new Response($.b as BodyInit, {
      headers: $.h,
      status: $.c,
    })
  }

  /* serve -------------------------------------------------------------------- */

  serve({
    hostname,
    port,
  }: {
    hostname?: string
    port?: number
  } = {}) {
    return Deno.serve({
      hostname,
      port,
    }, (request, data) => {
      return this.fetch(request, data)
    }).finished
  }
}

function isVersionWithinRange(
  version: Version,
  r: VersionRange,
): number | undefined {
  const v = parseInt(version.replace('v', ''))

  if (parseInt(r.replace('v', '')) === v) {
    return v
  }

  if (r.startsWith('v') && r.includes('...')) { // from (min) ... to (max)
    const from = parseInt(r.split('...')[0].replace('v', ''))
    const to = parseInt(r.split('...')[1].replace('v', ''))

    return v >= from && v <= to ? v : undefined
  } else if (r.startsWith('> ')) {
    return v > parseInt(r.replace('> v', '')) ? v : undefined
  } else if (r.startsWith('< ')) {
    return v < parseInt(r.replace('< v', '')) ? v : undefined
  } else if (r.startsWith('>= ')) {
    return v >= parseInt(r.replace('>= v', '')) ? v : undefined
  } else if (r.startsWith('<= ')) {
    return v <= parseInt(r.replace('<= v', '')) ? v : undefined
  }

  return undefined
}
