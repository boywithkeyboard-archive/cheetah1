// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { base, Method } from './base.ts'
import { Collection } from './Collection.ts'
import { Context } from './Context.ts'
import { Exception } from './Exception.ts'
import { Extension, validExtension } from './extensions.ts'
import { Handler, HandlerOrSchema, Payload } from './handler.ts'

export type AppContext = {
  env: Record<string, unknown> | undefined
  ip: string | undefined
  proxy: 'cloudflare' | 'none'
  routes: [Uppercase<Method>, RegExp, HandlerOrSchema[]][]
  runtime:
    | 'cloudflare'
    | 'deno'
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
   * @default 'none'
   */
  proxy?:
    | 'cloudflare'
    | 'none'

  /**
   * Set a custom error handler.
   */
  error?: (error: unknown, request: Request) => Response | Promise<Response>

  /**
   * Set a custom 404 handler.
   */
  notFound?: (request: Request) => Response | Promise<Response>
}

export class cheetah extends base<cheetah>() {
  #base
  #cors
  #error
  #extensions: [string, Extension][]
  #notFound
  #preflight
  #proxy: Exclude<AppConfig['proxy'], undefined>
  #routes: [Uppercase<Method>, RegExp, HandlerOrSchema[]][] = []
  #runtime: 'deno' | 'cloudflare'

  constructor({
    base,
    cors,
    preflight = false,
    proxy = 'none',
    error,
    notFound,
  }: AppConfig = {}) {
    super((method, pathname, handlers) => {
      this.#add(
        method,
        this.#base ? this.#base + pathname : pathname,
        handlers,
      )

      return this
    })

    this.#base = base === '/' ? undefined : base
    this.#cors = cors
    this.#error = error
    this.#extensions = []
    this.#notFound = notFound
    this.#preflight = preflight
    this.#proxy = proxy
    this.#runtime = typeof globalThis?.Deno?.serve !== 'function'
      ? 'cloudflare'
      : 'deno'
  }

  /* use ---------------------------------------------------------------------- */

  use<T extends Collection>(...extensions: Extension[]): this
  use<T extends Collection>(
    prefix: `/${string}`,
    ...extensions: Extension[]
  ): this
  use<T extends Collection>(
    prefix: `/${string}`,
    collection: T,
    ...extensions: Extension[]
  ): this

  use<T extends Collection>(...elements: (`/${string}` | T | Extension)[]) {
    let pre

    for (const e of elements) {
      if (typeof e === 'string') { // prefix
        pre = e
      } else if (e instanceof Collection) { // collection
        if (!pre || pre === '/') {
          pre = ''
        }

        const length = e.routes.length

        for (let i = 0; i < length; ++i) {
          let pathname = e.routes[i][1]

          if (pathname === '/') {
            pathname = ''
          }

          this.#add(
            e.routes[i][0],
            this.#base ? this.#base + pre + pathname : pre + pathname,
            e.routes[i][2],
          )
        }
      } else if (validExtension(e)) { // extension
        if (!pre) {
          pre = '*'
        }

        this.#extensions.push([pre, e])
      }
    }

    return this
  }

  /* router ------------------------------------------------------------------- */

  #add(
    method: Uppercase<Method>,
    pathname: string,
    handlers: HandlerOrSchema[],
  ) {
    this.#routes.push([
      method,
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
  }

  #match(method: string, pathname: string, preflight: boolean) {
    for (let i = 0; i < this.#routes.length; ++i) {
      if (
        method === this.#routes[i][0] ||
        method === 'OPTIONS' ||
        preflight && method === 'HEAD' && this.#routes[i][0] === 'GET'
      ) {
        const result = pathname.match(this.#routes[i][1])

        if (!result) {
          continue
        }

        return {
          handlers: this.#routes[i][2],
          params: result.groups ?? {},
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
    const ip = data?.remoteAddr && typeof globalThis.Deno?.serve === 'function'
      ? ((data as Deno.ServeHandlerInfo).remoteAddr)
        .hostname
      : req.headers.get('cf-connecting-ip') ?? undefined

    const parts = req.url.split('?')

    parts[0] = parts[0].slice(8)

    const pathname = parts[0].substring(parts[0].indexOf('/'))

    const qs: string | undefined = parts[1]

    if (this.#extensions.length > 0) {
      let body: Response | void = undefined

      for (let i = 0; i < this.#extensions.length; i++) {
        if (
          this.#extensions[i][0] !== '*' &&
          pathname.indexOf(this.#extensions[i][0]) !== 0
        ) {
          continue
        }

        const { onRequest } = this.#extensions[i][1]

        if (onRequest !== undefined) {
          const result = await onRequest(req, this.#extensions[i][1].__config)

          if (result !== undefined) {
            body = result
          }
        }
      }

      if (body !== undefined) {
        return body
      }
    }

    try {
      const route = this.#match(
        req.method,
        pathname,
        this.#preflight,
      )

      if (!route) {
        if (!this.#notFound) {
          throw new Exception(404)
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

      let response = await this.#handle(
        {
          env: data as Record<string, unknown>,
          ip,
          proxy: this.#proxy,
          routes: this.#routes,
          runtime: this.#runtime,
        },
        req,
        context?.waitUntil ??
          ((promise: Promise<unknown>) => {
            setTimeout(async () => {
              await promise
            }, 0)
          }),
        pathname,
        qs,
        route.params,
        route.handlers,
      )

      if (req.method === 'HEAD') {
        response = new Response(null, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      }

      return response
    } catch (err) {
      let res: Response

      if (err instanceof Exception) {
        res = err.response(req)
      } else if (this.#error) {
        res = await this.#error(err, req)
      } else {
        res = new Exception('Something Went Wrong').response(req)
      }

      if (req.method === 'HEAD') {
        res = new Response(null, {
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
    pathname: string,
    qs: string | undefined,
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
      qs,
      r,
      o,
      waitUntil,
    )

    // handle request

    const len = handlers.length

    let next = false

    for (let i = 0; i < len; ++i) {
      if (typeof handlers[i] !== 'function') {
        continue
      }

      if ($.b && !next) {
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

    switch ($.b.constructor.name) {
      case 'Object': {
        $.b = JSON.stringify($.b)

        $.h.set('content-length', $.b.length.toString())

        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'application/json; charset=utf-8')
        }

        if ((($.b as unknown) as { code: number }).code) {
          $.c = (($.b as unknown) as { code: number }).code
        }

        break
      }

      case 'String': {
        $.h.set('content-length', ($.b as string).length.toString())

        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'text/plain; charset=utf-8')
        }

        break
      }

      case 'ArrayBuffer': {
        $.h.set('content-length', ($.b as ArrayBuffer).byteLength.toString())

        break
      }

      case 'Uint8Array': {
        $.h.set('content-length', ($.b as Uint8Array).byteLength.toString())

        break
      }

      case 'Blob': {
        $.h.set('content-length', ($.b as Blob).size.toString())

        break
      }

      case 'Array': {
        $.b = JSON.stringify($.b)

        $.h.set('content-length', $.b.length.toString())

        if (!$.h.has('content-type')) {
          $.h.set('content-type', 'application/json; charset=utf-8')
        }

        if ((($.b as unknown) as { code: number }).code) {
          $.c = (($.b as unknown) as { code: number }).code
        }

        break
      }

      default: // FormData or ReadableStream
        break
    }

    for (let i = 0; i < this.#extensions.length; i++) {
      if (
        this.#extensions[i][0] !== '*' &&
        pathname.indexOf(this.#extensions[i][0]) !== 0
      ) {
        continue
      }

      const { onResponse } = this.#extensions[i][1]

      if (onResponse !== undefined) {
        onResponse(context, this.#extensions[i][1].__config)
      }
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
    }, this.fetch).finished
  }
}
