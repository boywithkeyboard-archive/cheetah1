import { Preferences } from '../mod.ts'
import { Handler, ObjectType, Route } from './_.ts'
import { Collection } from './Collection.ts'
import { Context } from './context/Context.ts'
import { PluginMethods } from './createPlugin.ts'
import { colors, ConnInfo, ZodType } from './deps.ts'
import { Exception } from './Exception.ts'
import { Router } from './Router.ts'

type RequestContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

export class cheetah {
  #router
  #runtime: 'deno' | 'cloudflare'
  #base
  #cors
  #cache
  #debugging
  #notFound
  #error
  #preflight
  #plugins
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
    debug = false,
    preflight = false,
    error,
    notFound,
  }: Preferences = {}) {
    this.#router = new Router()

    this.#base = base === '/' ? undefined : base
    this.#cors = cors
    this.#cache = cache
      ? {
        name: cache.name,
        maxAge: cache.maxAge ?? 0,
      }
      : undefined
    this.#debugging = debug
    this.#error = error
    this.#notFound = notFound
    this.#preflight = preflight
    this.#plugins = {
      beforeParsing: [],
      beforeHandling: [],
      beforeResponding: [],
    }

    const runtime = globalThis?.Deno
      ? 'deno'
      // deno-lint-ignore no-explicit-any
      : typeof (globalThis as any)?.WebSocketPair === 'function'
      ? 'cloudflare'
      : 'unknown'

    if (runtime === 'unknown') {
      throw new Error('Unknown Runtime')
    }

    this.#runtime = runtime
  }

  use<T extends Collection>(...plugins: PluginMethods[]): this
  use<T extends Collection>(
    prefix: `/${string}`,
    ...plugins: PluginMethods[]
  ): this
  use<T extends Collection>(
    prefix: `/${string}`,
    collection: T,
    ...plugins: PluginMethods[]
  ): this

  use<T extends Collection>(...items: (`/${string}` | T | PluginMethods)[]) {
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

          this.#router.add(
            item.routes[i][0],
            this.#base ? this.#base + prefix + url : prefix + url,
            item.routes[i][2],
          )
        }
      } else { // plugin
        if (!prefix) {
          prefix = '*'
        }

        for (const key in item) {
          // @ts-ignore:
          this.#plugins[key].push([prefix, item[key]])
        }
      }
    }

    return this
  }

  /* -------------------------------------------------------------------------- */
  /* Fetch Handler                                                              */
  /* -------------------------------------------------------------------------- */

  fetch = async (
    request: Request,
    env: Record<string, unknown> | ConnInfo = {},
    context?: RequestContext,
  ): Promise<Response> => {
    let cache: Cache | undefined

    const ip = env?.remoteAddr
      ? ((env as ConnInfo & { remoteAddr: { hostname: string } }).remoteAddr)
        .hostname
      : request.headers.get('cf-connecting-ip') ?? undefined

    if (
      this.#cache && request.method === 'GET' && this.#runtime === 'cloudflare'
    ) {
      cache = await caches.open(this.#cache.name)

      const cachedResponse = await cache.match(request)

      if (cachedResponse) {
        return cachedResponse
      }
    }

    const url = new URL(request.url)

    try {
      const route = this.#router.match(
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

      if (this.#debugging) {
        this.#log(
          response.ok ? 'fetch' : 'error',
          request.method,
          url.pathname,
          response.status,
        )
      }

      return response
    } catch (err) {
      let res: Response

      if (err instanceof Exception) {
        res = err.response(request)
      } else if (this.#error) {
        res = await this.#error(err, request)
      } else {
        res = new Exception('Something Went Wrong').response(request)
      }

      if (this.#debugging) {
        this.#log('error', request.method, url.pathname, res.status)
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
    // deno-lint-ignore no-explicit-any
    env: Record<string, any>,
    waitUntil: RequestContext['waitUntil'],
    ip: string | undefined,
    url: URL,
    params: Record<string, string>,
    route: Route[],
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

    /* beforeParsing Plugin ----------------------------------------------------- */

    for (let i = 0; i < this.#plugins.beforeParsing.length; ++i) {
      const key = this.#plugins.beforeParsing[i][0]

      if (
        key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key
      ) {
        continue
      }

      await this.#plugins.beforeParsing[i][1](request)
    }

    /* Set Variables ------------------------------------------------------------ */

    /* Construct Context -------------------------------------------------------- */

    let responseCode = 200

    const responseHeaders: Record<string, string> = {
      ...(this.#cors && {
        'access-control-allow-origin': this.#cors,
      }),
      ...(request.method === 'GET' && {
        'cache-control': !this.#cache || this.#cache.maxAge === 0
          ? 'max-age=0, private, must-revalidate'
          : `max-age: ${this.#cache.maxAge}`,
      }),
    }

    if (options?.cache !== undefined) {
      responseHeaders['cache-control'] =
        options.cache === false || options.cache.maxAge === 0
          ? `max-age=0, private, must-revalidate`
          : `max-age: ${options.cache.maxAge}`
    }

    let responseBody:
      | string
      | Record<string, unknown>
      | Blob
      | File
      | ReadableStream<unknown>
      | FormData
      | Uint8Array
      | ArrayBuffer
      | null = null

    const context = new Context(
      env,
      ip,
      params,
      request,
      this.#runtime,
      // @ts-ignore:
      options,
      waitUntil,
    )

    /* beforeHandling Plugin ---------------------------------------------------- */

    for (let i = 0; i < this.#plugins.beforeHandling.length; ++i) {
      const key = this.#plugins.beforeHandling[i][0]

      if (
        key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key
      ) {
        continue
      }

      // @ts-ignore:
      await this.#plugins.beforeHandling[i][1](context)
    }

    /* Route Handling ----------------------------------------------------------- */

    const length = route.length

    for (let i = 0; i < length; ++i) {
      if (typeof route[i] !== 'function') {
        continue
      }

      // deno-lint-ignore no-explicit-any
      const result = await (route[i] as Handler<any, any, any, any, any>)(
        context,
      )

      if (result) {
        responseBody = result
      }

      if (responseBody) {
        break
      }
    }

    /* beforeResponding Plugin -------------------------------------------------- */

    for (let i = 0; i < this.#plugins.beforeResponding.length; ++i) {
      const key = this.#plugins.beforeResponding[i][0]

      if (
        key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key
      ) {
        continue
      }

      // @ts-ignore:
      await this.#plugins.beforeResponding[i][1](context)
    }

    /* Construct Response ------------------------------------------------------- */

    if (responseCode !== 200 && responseCode !== 301) {
      delete responseHeaders['cache-control']
    }

    if (responseHeaders.location) {
      return new Response(null, {
        headers: responseHeaders,
        status: responseCode,
      })
    }

    if (!responseBody) {
      return new Response(null, {
        headers: responseHeaders,
        status: responseCode,
      })
    }

    if (
      responseBody !== null && responseBody !== undefined
    ) {
      if (typeof responseBody === 'string') {
        responseHeaders['content-length'] = responseBody.length.toString()

        if (!responseHeaders['content-type']) {
          responseHeaders['content-type'] = 'text/plain; charset=utf-8'
        }
      } else if (
        responseBody instanceof ArrayBuffer ||
        responseBody instanceof Uint8Array
      ) {
        responseHeaders['content-length'] = responseBody.byteLength.toString()
      } else if (responseBody instanceof Blob) {
        responseHeaders['content-length'] = responseBody.size.toString()
      } else if (responseBody instanceof FormData) {
        // TODO: calculate content length
      } else if (responseBody instanceof ReadableStream === false) {
        responseBody = JSON.stringify(responseBody)

        responseHeaders['content-length'] = responseBody.length.toString()

        if (!responseHeaders['content-type']) {
          responseHeaders['content-type'] = 'application/json; charset=utf-8'
        }

        if (((responseBody as unknown) as { code: number }).code) {
          responseCode = ((responseBody as unknown) as { code: number }).code
        }
      }
    }

    return new Response(responseBody as string, {
      headers: responseHeaders,
      status: responseCode,
    })
  }

  /* -------------------------------------------------------------------------- */
  /* Logger                                                                     */
  /* -------------------------------------------------------------------------- */

  #log(
    event: 'fetch' | 'error',
    method: string,
    pathname: string,
    statusCode: number,
  ) {
    if (!this.#debugging) {
      return
    }

    if (event === 'error') {
      console.error(
        colors.gray(
          `${colors.brightRed(statusCode.toString())} - ${method} ${pathname}`,
        ),
      )
    } else {
      console.log(
        colors.gray(
          `${
            statusCode === 301 || statusCode === 307
              ? colors.brightBlue(statusCode.toString())
              : colors.brightGreen(statusCode.toString())
          } - ${method} ${colors.white(pathname)}`,
        ),
      )
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Routes                                                                     */
  /* -------------------------------------------------------------------------- */

  /* Raw Method --------------------------------------------------------------- */

  // raw<RequestMethod extends 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete' | 'options', RequestUrl extends `/${string}`>(method: RequestMethod, url: RequestUrl, handler: (request: Request) => Response | Promise<Response>) {

  // }

  /* Get Method --------------------------------------------------------------- */

  get<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl, undefined>[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      cache?: false | { maxAge: number }
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      undefined,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cache?: false | { maxAge: number }
        cors?: string
      }
      | Handler<
        RequestUrl,
        never,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('GET', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Delete Method ------------------------------------------------------------ */

  delete<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this

  delete<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  delete<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      }
      | Handler<
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('DELETE', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Post Method -------------------------------------------------------------- */

  post<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this

  post<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  post<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      }
      | Handler<
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('POST', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Put Method --------------------------------------------------------------- */

  put<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this

  put<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  put<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      }
      | Handler<
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('PUT', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Patch Method ------------------------------------------------------------- */

  patch<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this

  patch<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  patch<
    RequestUrl extends `/${string}`,
    ValidatedBody extends ZodType,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      }
      | Handler<
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('PATCH', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Head Method -------------------------------------------------------------- */

  head<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl, never>[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      cors?: string
    },
    ...handler: Handler<
      RequestUrl,
      never,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    url: RequestUrl,
    ...handler: (
      | {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cors?: string
      }
      | Handler<
        RequestUrl,
        never,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.#router.add('HEAD', this.#base ? this.#base + url : url, handler)

    return this
  }
}
