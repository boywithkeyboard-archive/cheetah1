import { ConnInfo } from 'https://deno.land/std@0.193.0/http/server.ts'
import { base, Method } from './base.ts'
import { Collection } from './Collection.ts'
import { Context } from './Context.ts'
import { Exception } from './Exception.ts'
import { Extension, isValidExtension } from './extensions.ts'
import { Handler, HandlerOrSchema, Payload } from './handler.ts'

export type AppContext = {
  proxy: 'cloudflare' | 'none'
  routes: [Uppercase<Method>, RegExp, HandlerOrSchema[]][]
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

  cache?: {
    /**
     * A unique name for your cache.
     */
    name: string

    /**
     * Duration in seconds for how long a response should be cached.
     *
     * @since v0.11
     */
    maxAge?: number
  }

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
  #p: Exclude<AppConfig['proxy'], undefined>
  #r: [Uppercase<Method>, RegExp, HandlerOrSchema[]][] = []
  #runtime: 'deno' | 'cloudflare'
  #base
  #cors
  #cache
  #notFound
  #error
  #preflight
  #ext: [string, Extension][]

  // #plugins: {
  //   beforeParsing: [string, ((request: Request) => void | Promise<void>)][]
  //   beforeHandling: [
  //     string,
  //     ((
  //       c: Context<
  //         Record<string, never>,
  //         unknown,
  //         unknown,
  //         Record<string, string>,
  //         unknown
  //       >,
  //     ) => ResponsePayload | Promise<ResponsePayload>),
  //   ][]
  //   beforeResponding: [
  //     string,
  //     ((
  //       c: Context<
  //         Record<string, never>,
  //         unknown,
  //         unknown,
  //         Record<string, string>,
  //         unknown
  //       >,
  //     ) => ResponsePayload | Promise<ResponsePayload>),
  //   ][]
  // }

  constructor({
    base,
    cors,
    cache,
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

    this.#p = proxy

    this.#base = base === '/' ? undefined : base
    this.#cors = cors
    this.#cache = cache
      ? {
        name: cache.name,
        maxAge: cache.maxAge ?? 0,
      }
      : undefined
    this.#error = error
    this.#notFound = notFound
    this.#preflight = preflight
    this.#ext = []

    const runtime = globalThis?.Deno
      ? 'deno'
      : typeof (globalThis as Record<string, unknown>)?.WebSocketPair ===
          'function'
      ? 'cloudflare'
      : null

    if (!runtime) {
      throw new Error('Unknown Runtime')
    }

    this.#runtime = runtime
  }

  use<T extends Collection>(...exts: Extension[]): this
  use<T extends Collection>(
    prefix: `/${string}`,
    ...exts: Extension[]
  ): this
  use<T extends Collection>(
    prefix: `/${string}`,
    collection: T,
    ...exts: Extension[]
  ): this

  use<T extends Collection>(...items: (`/${string}` | T | Extension)[]) {
    let prefix

    for (const item of items) {
      if (typeof item === 'string') { // prefix
        prefix = item
      } else if (item instanceof Collection) { // collection
        if (!prefix) {
          throw new Error(
            'Please define a prefix when attaching a collection!',
          )
        }

        const length = item.routes.length

        for (let i = 0; i < length; ++i) {
          let url = item.routes[i][1]

          if (url === '/') {
            url = ''
          }

          if (prefix === '/') {
            // @ts-ignore:
            prefix = ''
          }

          this.#add(
            item.routes[i][0],
            this.#base ? this.#base + prefix + url : prefix + url,
            item.routes[i][2],
          )
        }
      } else if (isValidExtension(item)) { // extension
        if (!prefix) {
          prefix = '*'
        }

        this.#ext.push([prefix, item])
      }
    }

    return this
  }

  #add(
    method: Uppercase<Method>,
    pathname: string,
    handlers: HandlerOrSchema[],
  ) {
    this.#r.push([
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
    for (let i = 0; i < this.#r.length; ++i) {
      if (
        method === this.#r[i][0] ||
        method === 'OPTIONS' ||
        preflight && method === 'HEAD' && this.#r[i][0] === 'GET'
      ) {
        const result = pathname.match(this.#r[i][1])

        if (!result) {
          continue
        }

        return {
          handlers: this.#r[i][2],
          params: result.groups ?? {},
        }
      }
    }

    return null
  }

  /* -------------------------------------------------------------------------- */
  /* Fetch Handler                                                              */
  /* -------------------------------------------------------------------------- */

  fetch = async (
    request: Request,
    env: Record<string, unknown> | ConnInfo = {},
    context?: {
      waitUntil: (promise: Promise<unknown>) => void
    },
  ): Promise<Response> => {
    let cache: Cache | undefined

    const ip = env?.remoteAddr
      ? ((env as ConnInfo & { remoteAddr: { hostname: string } }).remoteAddr)
        .hostname
      : request.headers.get('cf-connecting-ip') ?? undefined

    const url = new URL(request.url)

    let body: Response | void = undefined

    for (let i = 0; i < this.#ext.length; i++) {
      if (
        this.#ext[i][0] !== '*' && !url.pathname.startsWith(this.#ext[i][0])
      ) {
        continue
      }

      const { onRequest } = this.#ext[i][1]

      if (onRequest !== undefined) {
        const result = await onRequest(request, this.#ext[i][1].__config)

        if (result !== undefined) {
          body = result
        }
      }
    }

    if (body !== undefined) {
      return body
    }

    try {
      const route = this.#match(
        request.method,
        url.pathname,
        this.#preflight,
      )

      if (!route) {
        if (this.#notFound) {
          if (request.method !== 'HEAD') {
            return await this.#notFound(request)
          }

          const response = await this.#notFound(request)

          return new Response(null, {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
          })
        }

        throw new Exception(404)
      }

      let response = await this.#handle(
        request,
        env,
        context?.waitUntil ??
          ((promise: Promise<unknown>) => {
            setTimeout(async () => {
              await promise
            }, 0)
          }),
        ip,
        url,
        route.params,
        route.handlers,
      )

      if (request.method === 'HEAD') {
        response = new Response(null, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      }

      if (cache && response.ok && context) {
        context.waitUntil(cache.put(request, response.clone()))
      }

      return response
    } catch (err) {
      //console.log(err)

      let res: Response

      if (err instanceof Exception) {
        res = err.response(request)
      } else if (this.#error) {
        res = await this.#error(err, request)
      } else {
        res = new Exception('Something Went Wrong').response(request)
      }

      if (request.method === 'HEAD') {
        res = new Response(null, {
          headers: res.headers,
          status: res.status,
          statusText: res.statusText,
        })
      }

      return res
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Request Handler                                                            */
  /* -------------------------------------------------------------------------- */

  async #handle(
    request: Request,
    env: Record<string, any>,
    waitUntil: (promise: Promise<unknown>) => void,
    ip: string | undefined,
    url: URL,
    params: Record<string, string | undefined>,
    route: HandlerOrSchema[],
  ) {
    const options = typeof route[0] !== 'function' ? route[0] : null

    /* Preflight Request -------------------------------------------------------- */

    if (
      request.method === 'OPTIONS' &&
      request.headers.has('origin') &&
      request.headers.has('access-control-request-method')
    ) {
      return new Response(null, {
        status: 204,
        headers: {
          ...((this.#cors || options?.cors) &&
            { 'access-control-allow-origin': options?.cors ?? this.#cors }),
          'access-control-allow-methods': '*',
          'access-control-allow-headers':
            request.headers.get('access-control-request-headers') ?? '*',
          'access-control-allow-credentials': 'false',
          'access-control-max-age': '600',
        },
      })
    }

    /* Set Variables ------------------------------------------------------------ */

    /* Construct Context -------------------------------------------------------- */

    // const responseHeaders: Record<string, string> = {
    //   ...(this.#cors && {
    //     'access-control-allow-origin': this.#cors,
    //   }),
    //   ...(request.method === 'GET' && {
    //     'cache-control': !this.#cache || this.#cache.maxAge === 0
    //       ? 'max-age=0, private, must-revalidate'
    //       : `max-age: ${this.#cache.maxAge}`,
    //   }),
    // }

    // if (options?.cache !== undefined) {
    //   responseHeaders['cache-control'] =
    //     options.cache === false || options.cache.maxAge === 0
    //       ? `max-age=0, private, must-revalidate`
    //       : `max-age: ${options.cache.maxAge}`
    // }

    const __internal: {
      b: Exclude<Payload, void> | null
      c: number
      h: Headers
    } = {
      b: null,
      c: 200,
      h: new Headers(),
    }

    const context = new Context(
      {
        proxy: this.#p,
        routes: this.#r,
      },
      __internal,
      env,
      ip,
      params,
      request,
      this.#runtime,
      // @ts-ignore:
      options,
      waitUntil,
    )

    /* Route Handling ----------------------------------------------------------- */

    const length = route.length

    let next = false

    for (let i = 0; i < length; ++i) {
      if (typeof route[i] !== 'function') {
        continue
      }

      if (__internal.b && !next) {
        break
      }

      next = false

      const result = await (route[i] as Handler<unknown>)(
        context,
        () => {
          next = true
        },
      )

      if (result) {
        __internal.b = result
      }
    }

    /* Construct Response ------------------------------------------------------- */

    let c = __internal.c
    const h = __internal.h

    if (c !== 200 && c !== 301) {
      h.delete('cache-control')
    }

    if (h.has('location')) {
      return new Response(null, {
        headers: h,
        status: c,
      })
    }

    if (!__internal.b) {
      return new Response(null, {
        headers: h,
        status: c,
      })
    }

    if (
      __internal.b !== null && __internal.b !== undefined
    ) {
      if (typeof __internal.b === 'string') {
        h.set('content-length', __internal.b.length.toString())

        if (!h.has('content-type')) {
          h.set('content-type', 'text/plain; charset=utf-8')
        }
      } else if (
        __internal.b instanceof ArrayBuffer ||
        __internal.b instanceof Uint8Array
      ) {
        h.set('content-length', __internal.b.byteLength.toString())
      } else if (__internal.b instanceof Blob) {
        h.set('content-length', __internal.b.size.toString())
      } else if (
        __internal.b instanceof FormData ||
        __internal.b instanceof ReadableStream
      ) {
        // TODO: calculate content length
      } else {
        __internal.b = JSON.stringify(__internal.b)

        h.set('content-length', __internal.b.length.toString())

        if (!h.has('content-type')) {
          h.set('content-type', 'application/json; charset=utf-8')
        }

        if (((__internal.b as unknown) as { code: number }).code) {
          c = ((__internal.b as unknown) as { code: number }).code
        }
      }
    }

    for (let i = 0; i < this.#ext.length; i++) {
      if (
        this.#ext[i][0] !== '*' && !url.pathname.startsWith(this.#ext[i][0])
      ) {
        continue
      }

      const { onResponse } = this.#ext[i][1]

      if (onResponse !== undefined) {
        onResponse(context, this.#ext[i][1].__config)
      }
    }

    return new Response(__internal.b as BodyInit, {
      headers: h,
      status: c,
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
      // @ts-ignore
    }, this.fetch).finished
  }
}
