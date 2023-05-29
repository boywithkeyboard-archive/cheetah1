import { ContinentCode, IncomingRequestCfProperties } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230518.0/index.ts'
import { DeadlineError, deadline } from 'https://deno.land/std@0.189.0/async/deadline.ts'
import { brightBlue, brightGreen, brightRed, gray, white } from 'https://deno.land/std@0.189.0/fmt/colors.ts'
import { ConnInfo } from 'https://deno.land/std@0.189.0/http/server.ts'
import { TSchema } from 'https://esm.sh/@sinclair/typebox@0.28.13'
import { Collection } from './Collection.ts'
import { Context } from './Context.d.ts'
import { Exception } from './Exception.ts'
import { Handler, Route } from './Handler.d.ts'
import { Router } from './Router.ts'
import { PluginMethods } from './createPlugin.ts'
import { ObjectSchema, Schema, Validator } from './validator/Validator.d.ts'

export type Config<
  V extends Validator = never
> = {
  /**
   * A prefix for all routes, e.g. `/api`.
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
     * Duration in seconds for how long a cached response should be held in memory.
     */
    duration: number
  }

  /**
   * Enable **Debug Mode**. As a result, every fetch and error event will be logged.
   */
  debug?: boolean

  /**
   * Set a validator to validate the body, cookies, headers, and query parameters of the incoming request.
   */
  validator?: V

  /**
   * Set a custom error handler.
   */
  error?: (error: unknown, request: Request) => Response | Promise<Response>

  /**
   * Set a custom 404 handler.
   */
  notFound?: (request: Request) => Response | Promise<Response>
}

type RequestContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

export class cheetah<
  V extends Validator = never
> {
  #router
  #runtime: 'deno' | 'cloudflare'
  #base
  #cors
  #cache
  #debugging
  #validator: Validator | undefined
  #notFound
  #error
  #plugins: {
    beforeParsing: Record<string, PluginMethods['beforeParsing'][]>
    beforeHandling: Record<string, PluginMethods['beforeHandling'][]>
    beforeResponding: Record<string, PluginMethods['beforeResponding'][]>
  }
  
  constructor(config: Config<V> = {}) {
    this.#router = new Router()

    this.#base = config.base === '/' ? undefined : config.base
    this.#cors = config.cors
    this.#cache = config.cache
    this.#debugging = config.debug ?? false
    this.#validator = config.validator
    this.#error = config.error
    this.#notFound = config.notFound
    this.#plugins = {
      beforeParsing: {},
      beforeHandling: {},
      beforeResponding: {}
    }
    
    const runtime = globalThis?.Deno
      ? 'deno'
      // deno-lint-ignore no-explicit-any
      : typeof (globalThis as any)?.WebSocketPair === 'function'
      ? 'cloudflare'
      : 'unknown'

    if (runtime === 'unknown')
      throw new Error('Unknown Runtime')

    this.#runtime = runtime
  }

  use<T extends Collection>(...plugins: PluginMethods[]): this
  use<T extends Collection>(prefix: `/${string}`, ...plugins: PluginMethods[]): this
  use<T extends Collection>(prefix: `/${string}`, collection: T, ...plugins: PluginMethods[]): this

  use<T extends Collection>(...items: (`/${string}` | T | PluginMethods)[]) {
    let prefix

    for (const item of items) {
      if (typeof item === 'string') { // prefix
        prefix = item
      } else if (item instanceof Collection) { // collection
        if (!prefix)
          throw new Error('Please define a prefix when attaching a collection!')

        const length = item.routes.length

        for (let i = 0; i < length; ++i) {
          let url = item.routes[i][1]

          if (url === '/')
            url = ''

          if (prefix === '/')
            // @ts-ignore: ok
            prefix = ''

          this.#router.add(
            item.routes[i][0],
            this.#base ? this.#base + prefix + url : prefix + url,
            item.routes[i][2]
          )
        }
      } else { // plugin
        if (!prefix)
          prefix = '*'

        for (const key in item) {
          if (this.#plugins[key as keyof PluginMethods][prefix])
            // @ts-ignore:
            this.#plugins[key as keyof PluginMethods][prefix].push(item[key])
          else
            // @ts-ignore:
            this.#plugins[key as keyof PluginMethods][prefix] = [item[key]]
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
    context?: RequestContext
  ): Promise<Response> => {
    let cache: Cache | undefined

    const ip = env?.remoteAddr
      ? ((env as ConnInfo & { remoteAddr: { hostname: string }}).remoteAddr).hostname
      : request.headers.get('cf-connecting-ip') ?? undefined

    if (this.#cache && request.method === 'GET' && this.#runtime === 'cloudflare') {
      cache = await caches.open(this.#cache.name)
  
      const cachedResponse = await cache.match(request)
  
      if (cachedResponse)
        return cachedResponse
    }

    const url = new URL(request.url)

    try {
      const route = this.#router.match(request.method, url.pathname)

      if (!route) {
        if (this.#notFound)
          return this.#notFound(request)

        throw new Exception(404)
      }

      const response = await this.#handle(
        request,
        env,
        context?.waitUntil
        ?? ((promise: Promise<unknown>) => {
          setTimeout(async () => {
            await promise
          }, 0)
        }),
        ip,
        url,
        route.params,
        route.handlers
      )

      if (cache && response.ok && this.#runtime === 'cloudflare' && context)
        context.waitUntil(cache.put(request, response.clone()))

      if (this.#debugging)
        this.#log(response.ok ? 'fetch' : 'error', request.method, url.pathname, response.status)

      return response
    } catch (err) {
      let res: Response

      if (err instanceof Exception)
        res = err.response(request)
      else if (this.#error)
        res = await this.#error(err, request)
      else
        res = new Response(JSON.stringify({
          message: 'Something Went Wrong',
          code: 500
        }), {
          status: 500,
          headers: {
            'content-type': 'application/json; charset=utf-8;'
          }
        })

      if (this.#debugging)
        this.#log('error', request.method, url.pathname, res.status)

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
    route: Route[]
  ) {
    const options = typeof route[0] !== 'function' ? route[0] : null

    /* Preflight Request -------------------------------------------------------- */

    if (
      request.method === 'OPTIONS' &&
      request.headers.has('origin') &&
      request.headers.has('access-control-request-method')
    )
      return new Response(null, {
        status: 204,
        headers: {
          ...((this.#cors || options?.cors) && { 'access-control-allow-origin': options?.cors ?? this.#cors }),
          'access-control-allow-methods': '*',
          'access-control-allow-headers': request.headers.get('access-control-request-headers') ?? '*',
          'access-control-allow-credentials': 'false',
          'access-control-max-age': '600'
        }
      })

    /* beforeParsing Plugin ----------------------------------------------------- */

    for (const key in this.#plugins.beforeParsing) {
      if (key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key)
        continue
     
      const length = this.#plugins.beforeParsing[key].length

      for (let i = 0; i < length; ++i)
        // @ts-ignore:
        await this.#plugins.beforeParsing[key][i](request)
    }

    /* Set Variables ------------------------------------------------------------ */

    const headers: Record<string, string> = {}
    const query: Record<string, unknown> = {}
    let cookies: Record<string, string> = {}
    let body
  
    if (this.#validator && options) {
      /* Parse Headers ------------------------------------------------------------ */

      if (options.headers) {
        let num = 0

        for (const [key, value] of request.headers) {
          if (num === 50)
            break

          if (!headers[key.toLowerCase()])
            headers[key.toLowerCase()] = value

          num++
        }

        const isValid = this.#validator.name === 'typebox' && this.#validator.check
          ? this.#validator.check(options.headers as TSchema, headers)
          : options.headers.safeParse(headers).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Query Parameters --------------------------------------------------- */
    
      if (options.query) {
        for (const [key, value] of url.searchParams) {
          if (value === '' || value === 'true')
            query[key] = true
          else if (value === 'false')
            query[key] = false
          else if (value.includes(','))
            query[key] = value.split(',')
          else if (!isNaN((value as unknown) as number) && !isNaN(parseFloat(value)))
            query[key] = parseInt(value)
          else if (value === 'undefined')
            query[key] = undefined
          else if (value === 'null')
            query[key] = null
          else
            query[key] = value
        }

        const isValid = this.#validator.name === 'typebox' && this.#validator.check
          ? this.#validator.check(options.query as TSchema, query)
          : options.query.safeParse(query).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Cookies ------------------------------------------------------------ */

      if (options.cookies) {
        try {
          const cookiesHeader = request.headers.get('cookies') ?? ''

          if (cookiesHeader.length > 1000)
            throw new Exception(413)

          cookies = cookiesHeader
            .split(/;\s*/)
            .map((pair) => pair.split(/=(.+)/))
            .reduce((acc: Record<string, string>, [key, value]) => {
              acc[key] = value
      
              return acc
            }, {})

          delete cookies['']
        } catch (_err) {
          cookies = {}
        }

        const isValid = this.#validator.name === 'typebox' && this.#validator.check
          ? this.#validator.check(options.cookies as TSchema, cookies)
          : options.cookies.safeParse(cookies).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Body --------------------------------------------------------------- */
    
      if (options.body) {
        try {
          if (
            options.body?._def?.typeName === 'ZodObject' ||
            // @ts-ignore: typescript bs
            options.body[Object.getOwnPropertySymbols(options.body)[0]] === 'Object'
          ) {
            if (options.transform === true && request.headers.get('content-type') === 'multipart/form-data') {
              const formData = await deadline(request.formData(), 3000)

              body = {} as Record<string, unknown>

              for (const [key, value] of formData.entries())
                body[key] = value
            } else {
              body = await deadline(request.json(), 3000)
            }
          } else if (
            options.body._def?.typeName === 'ZodString' ||
            // @ts-ignore: typescript bs
            options.body[Object.getOwnPropertySymbols(options.body)[0]] === 'String'
          ) {
            body = await deadline(request.text(), 3000)
          }
        } catch (err) {
          throw new Exception(err instanceof DeadlineError ? 413 : 400)
        }

        const isValid = this.#validator.name === 'typebox' && this.#validator.check
          ? this.#validator.check(options.body as TSchema, body)
          : options.body.safeParse(body).success

        if (!isValid)
          throw new Exception(400)
      }
    }
  
    /* Construct Context -------------------------------------------------------- */
  
    // deno-lint-ignore no-explicit-any
    let geo: ReturnType<Context<any, Record<string, string>>['req']['geo']>
    let requiresFormatting = true
    let responseCode = 200

    const responseHeaders: Record<string, string> = {
      ...(this.#cors && { 'access-control-allow-origin': this.#cors }),
      ...(request.method === 'GET' && { 'cache-control': `max-age=${this.#cache ?? 0}` })
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
      | null
    = null
  
    const context: Context<Record<string, string>> = {
      env,
      waitUntil,
      runtime: this.#runtime,
  
      req: {
        ip,
        
        raw: () => request.clone(),
  
        body,
        cookies,
        headers,
        param: key => params[key],
        query,
        geo: () => {
          if (geo)
            return geo

          if (this.#runtime === 'cloudflare') {
            const { cf } = (request as Request & { cf: IncomingRequestCfProperties })

            geo = {
              city: cf.city,
              region: cf.region,
              country: cf.country,
              continent: cf.continent,
              regionCode: cf.regionCode,
              latitude: cf.latitude,
              longitude: cf.longitude,
              timezone: cf.timezone,
              datacenter: cf.colo
            }
          } else {
            geo = {
              city: request.headers.get('cf-ipcity') ?? undefined,
              country: request.headers.get('cf-ipcountry') ?? undefined,
              continent: request.headers.get('cf-ipcontinent') as ContinentCode ?? undefined,
              latitude: request.headers.get('cf-iplatitude') ?? undefined,
              longitude: request.headers.get('cf-iplongitude') ?? undefined
            }
          }
  
          return geo
        },
        async buffer(d) {
          try {
            const promise = request.bodyUsed
              ? request.clone().arrayBuffer()
              : request.arrayBuffer()

            return await deadline(promise, d ?? 3000)
          } catch (_err) {
            return null
          }
        },
        async blob(d) {
          try {
            const promise = request.bodyUsed
              ? request.clone().blob()
              : request.blob()

            return await deadline(promise, d ?? 3000)
          } catch (_err) {
            return null
          }
        },
        async formData(d) {
          try {
            const promise = request.bodyUsed
              ? request.clone().formData()
              : request.formData()

            return await deadline(promise, d ?? 3000)
          } catch (_err) {
            return null
          }
        },
        stream() {
          return request.bodyUsed ? request.clone().body : request.body
        }
      },
  
      res: {
        code(code) {
          responseCode = code
        },
  
        cookie(name, value, options) {
          let cookie = `${name}=${value};`
  
          responseHeaders['set-cookie'] = (
            options?.expiresAt && (cookie += ` expires=${options.expiresAt.toUTCString()};`),
            options?.maxAge && (cookie += ` max-age=${options.maxAge};`),
            options?.domain && (cookie += ` domain=${options.domain};`),
            options?.path && (cookie += ` path=${options.path};`),
            options?.secure && (cookie += ' secure;'),
            options?.httpOnly && (cookie += ' httpOnly;'),
            options?.sameSite && (cookie += ` sameSite=${
              options.sameSite.charAt(0).toUpperCase() +
              options.sameSite.slice(1)
            };`),
            cookie
          )
        },
  
        header(name, value) {
          responseHeaders[name.toLowerCase()] = value
        },
  
        redirect(destination, code) {
          responseHeaders.location = destination
          responseCode = code ?? 307
        },

        blob(blob, code) {
          responseBody = blob
          requiresFormatting = false

          responseHeaders['content-length'] = blob.size.toString()
          
          if (code)
            responseCode = code
        },

        stream(stream, code) {
          responseBody = stream
          requiresFormatting = false
          
          if (code)
            responseCode = code
        },

        formData(formData, code) {
          responseBody = formData
          requiresFormatting = false
          
          if (code)
            responseCode = code
        },

        buffer(buffer, code) {
          responseBody = buffer
          requiresFormatting = false

          responseHeaders['content-length'] = buffer.byteLength.toString()
          
          if (code)
            responseCode = code
        },

        json(json, code) {
          responseBody = JSON.stringify(json)
          requiresFormatting = false

          if (!responseHeaders['content-type'])
            responseHeaders['content-type'] = 'application/json; charset=utf-8'

          responseHeaders['content-length'] = responseBody.length.toString()
          
          if (code)
            responseCode = code
        },

        text(text, code) {
          responseBody = text
          requiresFormatting = false

          if (!responseHeaders['content-type'])
            responseHeaders['content-type'] = 'text/plain; charset=utf-8'

          responseHeaders['content-length'] = text.length.toString()
          
          if (code)
            responseCode = code
        }
      }
    }

    /* beforeHandling Plugin ---------------------------------------------------- */

    for (const key in this.#plugins.beforeHandling) {
      if (key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key)
        continue
     
      const length = this.#plugins.beforeHandling[key].length

      for (let i = 0; i < length; ++i)
        // @ts-ignore:
        await this.#plugins.beforeHandling[key][i](context)
    }

    /* Route Handling ----------------------------------------------------------- */

    const length = route.length

    for (let i = 0; i < length; ++i) {
      if (typeof route[i] !== 'function')
        continue

      // deno-lint-ignore no-explicit-any
      const result = await (route[i] as Handler<any, any, any, any, any>)(context)

      if (result)
        responseBody = result

      if (responseBody)
        break
    }

    /* afterHandling Plugin ----------------------------------------------------- */

    for (const key in this.#plugins.beforeResponding) {
      if (key !== '*' && url.pathname[0] !== key + '/' && url.pathname !== key)
        continue
     
      const length = this.#plugins.beforeResponding[key].length

      for (let i = 0; i < length; ++i)
        // @ts-ignore:
        await this.#plugins.beforeResponding[key][i](context)
    }

    /* Construct Response ------------------------------------------------------- */
  
    if (responseCode !== 200 && responseCode !== 301)
      delete responseHeaders['cache-control']
  
    if (responseHeaders.location)
      return new Response(null, {
        headers: responseHeaders,
        status: responseCode
      })
  
    if (!responseBody)
      return new Response(null, {
        headers: responseHeaders,
        status: responseCode
      })

    if (requiresFormatting && responseBody !== null && responseBody !== undefined) {
      if (typeof responseBody === 'string') {
        responseHeaders['content-length'] = responseBody.length.toString()
    
        if (!responseHeaders['content-type'])
          responseHeaders['content-type'] = 'text/plain; charset=utf-8'
      } else {
        responseBody = JSON.stringify(responseBody)
    
        responseHeaders['content-length'] = responseBody.length.toString()
    
        if (!responseHeaders['content-type'])
          responseHeaders['content-type'] = 'application/json; charset=utf-8'
    
        if (((responseBody as unknown) as { code: number }).code)
          responseCode = ((responseBody as unknown) as { code: number }).code
      }
    }
  
    return new Response(responseBody as string, {
      headers: responseHeaders,
      status: responseCode
    })
  }

  /* -------------------------------------------------------------------------- */
  /* Logger                                                                     */
  /* -------------------------------------------------------------------------- */

  #log(event: 'fetch' | 'error', method: string, pathname: string, statusCode: number) {
    if (!this.#debugging)
      return

    if (event === 'error')
      console.error(gray(`${brightRed(statusCode.toString())} - ${method} ${pathname}`))
    else
      console.log(
        gray(`${statusCode === 301 || statusCode === 307
          ? brightBlue(statusCode.toString())
          : brightGreen(statusCode.toString())} - ${method} ${white(pathname)
        }`)
      )
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
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
      undefined,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cors?: string
      } |
      Handler<
        RequestUrl,
        undefined,
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      } |
      Handler<
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      } |
      Handler<
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      } |
      Handler<
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
    ValidatedBody extends Schema,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cors?: string
      } |
      Handler<
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
    ...handler: Handler<RequestUrl, undefined>[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
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
      undefined,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    ...handler: (
      {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cors?: string
      } |
      Handler<
        RequestUrl,
        undefined,
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
