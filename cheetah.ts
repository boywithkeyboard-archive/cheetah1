import { IncomingRequestCfProperties } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230321.0/index.ts'
import Router from 'https://cdn.jsdelivr.net/npm/@medley/router@0.2.1/+esm'
import { Context } from './Context.d.ts'
import { Exception } from './Exception.ts'
import { Handler } from './Handler.d.ts'
import { CloudflareRequest, ObjectSchema, RequestContext, Schema, Validator } from './types.ts'

export class cheetah<Environment extends Record<string, unknown> = Record<string, never>> {
  #name
  #base
  #cors
  #cache
  #validator
  #router
  #env: Environment | undefined
  #routers
  
  constructor(options?: {
    name?: string
    base?: string
    cors?: string
    cache?: string
    validator?: Validator<'typebox'> | Validator<'zod'>
    notFound?: () => void
    error?: () => void
  }) {
    // deno-lint-ignore no-explicit-any
    this.#routers = new Map<string, cheetah<any>>()

    this.#name = options?.name
    this.#base = options?.base
    this.#cors = options?.cors
    this.#cache = options?.cache as number | undefined
    this.#validator = options?.validator

    this.#router = new Router()
  }

  use(base: string, app: cheetah) {
    this.#routers = this.#routers.set(this.#base + base, app)
  }

  /* -------------------------------------------------------------------------- */
  /* Fetch Handler                                                              */
  /* -------------------------------------------------------------------------- */

  async fetch(
    request: CloudflareRequest | Request,
    env?: Environment,
    context?: RequestContext,
    base?: string
  ): Promise<Response> {
    // base = base && this.base ? base + this.base : this.base ? this.base : base
    base = this.#base
    env = this.#env ?? (env ? env : globalThis.Deno ? globalThis.Deno.env.toObject() : {}) as Environment | undefined

    let cache: Cache | undefined

    if ( this.#cache && request.method === 'GET') {
      cache = await caches.open(this.#name ?? 'cheetah')
  
      const cachedResponse = await cache.match(request)
  
      if (cachedResponse)
        return cachedResponse
    }

    const url = new URL(request.url)

    // if (this.routers.size > 0)
    //   for (const [key, value] of this.routers)
    //     if (url.pathname.startsWith(key))
    //       return value.fetch(request, env, context, base)

    try {
      const route = this.#router.find(url.pathname)

      if (!route?.store?.[request.method])
        throw new Exception(404)

      const waitUntil = context
        ? context.waitUntil
        // polyfill for deno
        : (promise: Promise<unknown>) => {
          setTimeout(async () => {
            await promise
          }, 1000)
        }

      const response = await this.#handle(
        request,
        env,
        waitUntil,
        url,
        route.store.params,
        route.store[request.method]
      )

      if (cache && response.ok)
        waitUntil(cache.put(request, response.clone()))

      return response
    } catch (err) {
      if (err instanceof Exception)
        return err.response

      return new Response(JSON.stringify({
        message: 'Something Went Wrong',
        code: 500
      }), {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8;'
        }
      })
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Request Handler                                                            */
  /* -------------------------------------------------------------------------- */

  async #handle(
    request: CloudflareRequest | Request,
    // deno-lint-ignore no-explicit-any
    env: any,
    waitUntil: RequestContext['waitUntil'],
    url: URL,
    params: Record<string, string>,
    route: (
      {
        body?: Schema,
        cookies?: ObjectSchema,
        headers?: ObjectSchema,
        query?: ObjectSchema
      } |
      // deno-lint-ignore no-explicit-any
      Handler<Environment, any, any, any, any, any>
    )[]
  ) {
    /* Preflight Request -------------------------------------------------------- */
  
    if (
      request.method === 'OPTIONS' &&
      request.headers.has('origin') &&
      request.headers.has('access-control-request-method')
    )
      return new Response(null, {
        status: 204,
        headers: {
          ...(this.#cors && { 'access-control-allow-origin': this.#cors }),
          'access-control-allow-methods': '*',
          'access-control-allow-headers': request.headers.get('access-control-request-headers') ?? '*',
          'access-control-allow-credentials': 'false',
          'access-control-max-age': '600'
        }
      })

    /* Set Variables ------------------------------------------------------------ */

    const schema = typeof route[0] !== 'function' ? route[0] : null
    const headers: Record<string, string> = {}
    let query: Record<string, unknown> = {}
    let cookies: Record<string, string> = {}
    let body
  
    if (this.#validator && schema) {
      /* Parse Headers ------------------------------------------------------------ */
  
      if (schema.headers) {
        for (const [key, value] of request.headers)
          headers[key.toLowerCase()] = value

        const isValid = this.#validator.name === 'typebox'
          ? this.#validator.check(schema.headers, headers)
          : schema.headers.safeParse(headers).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Query Parameters --------------------------------------------------- */
    
      if (schema.query) {
        query = Object.fromEntries(url.searchParams)
    
        for (const key in query) {
          const item = query[key] as string
        
          if (item === '' || item === 'true')
            query[key] = true
          else if (item === 'false')
            query[key] = false
          else if (item.includes(','))
            query[key] = item.split(',')
          else if (!isNaN((item as unknown) as number) && !isNaN(parseFloat(item)))
            query[key] = parseInt(item)
          else if (item === 'undefined')
            query[key] = undefined
          else if (item === 'null')
            query[key] = null
        }

        const isValid = this.#validator.name === 'typebox'
          ? this.#validator.check(schema.query, query)
          : schema.query.safeParse(query).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Cookies ------------------------------------------------------------ */

      if (schema.cookies) {
        try {
          cookies = (request.headers.get('cookies') || '')
            .split(/;\s*/)
            .map((pair) => pair.split(/=(.+)/))
            .reduce((acc: Record<string, string>, [key, value]) => {
              acc[key] = value
      
              return acc
            }, {})
        } catch (_err) {
          cookies = {}
        }

        const isValid = this.#validator.name === 'typebox'
          ? this.#validator.check(schema.cookies, cookies)
          : schema.cookies.safeParse(cookies).success

        if (!isValid)
          throw new Exception(400)
      }
    
      /* Parse Body --------------------------------------------------------------- */
    
      if (schema.body) {
        if (
          schema.body?._def?.typeName === 'ZodObject' ||
          // @ts-ignore: typescript bs
          schema.body[Object.getOwnPropertySymbols(schema.body)[0]] === 'Object'
        )
          body = await request.json()
        else if (
          schema.body._def?.typeName === 'ZodString' ||
          // @ts-ignore: typescript bs
          schema.body[Object.getOwnPropertySymbols(schema.body)[0]] === 'String'
        )
          body = await request.text()

        const isValid = this.#validator.name === 'typebox'
          ? this.#validator.check(schema.body, body)
          : schema.body.safeParse(body).success

        if (!isValid)
          throw new Exception(400)
      }
    }
  
    /* Construct Context -------------------------------------------------------- */
  
    let geo: ReturnType<Context<Environment, Record<string, string>>['req']['geo']>
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

    let isResponseBodyObject = true
  
    const context: Context<Environment, Record<string, string>> = {
      env: env as Environment,
      waitUntil,
  
      req: {
        raw: () => request.clone(),
  
        body,
        cookies,
        headers,
        param: key => params[key],
        query,
        geo() {
          if (geo)
            return geo

          const cf: IncomingRequestCfProperties | undefined = (request as CloudflareRequest).cf
  
          geo = {
            ip: request.headers.get('cf-connecting-ip') ?? undefined,
            city: cf?.city,
            region: cf?.region,
            country: cf?.country,
            continent: cf?.continent,
            regionCode: cf?.regionCode,
            latitude: cf?.latitude,
            longitude: cf?.longitude,
            timezone: cf?.timezone,
            datacenter: cf?.colo
          }
  
          return geo
        },
        async buffer() {
          return request.bodyUsed ? await request.clone().arrayBuffer() : request.arrayBuffer()
        },
        async blob() {
          return request.bodyUsed ? await request.clone().blob() : request.blob()
        },
        async formData() {
          return request.bodyUsed ? await request.clone().formData() : request.formData()
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
          responseHeaders[name] = value
        },
  
        redirect(destination, code) {
          responseHeaders.location = destination
          responseCode = code ?? 307
        },

        blob(blob, code) {
          responseBody = blob
          isResponseBodyObject = false

          responseHeaders['content-length'] = blob.size.toString()
          
          if (code)
            responseCode = code
        },

        stream(stream, code) {
          responseBody = stream
          isResponseBodyObject = false
          
          if (code)
            responseCode = code
        },

        formData(formData, code) {
          responseBody = formData
          isResponseBodyObject = false
          
          if (code)
            responseCode = code
        },

        buffer(buffer, code) {
          responseBody = buffer
          isResponseBodyObject = false

          responseHeaders['content-length'] = buffer.byteLength.toString()
          
          if (code)
            responseCode = code
        }
      }
    }

    const length = route.length

    for (let i = 0; i < length; ++i) {
      if (typeof route[i] !== 'function')
        continue

      // deno-lint-ignore no-explicit-any
      const result = await (route[i] as Handler<Environment, any, any, any, any, any>)(context)

      if (result)
        responseBody = result

      if (responseBody)
        break
    }
  
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
  
    if (typeof responseBody === 'string') {
      responseHeaders['content-length'] = responseBody.length.toString()
  
      if (!responseHeaders['content-type'])
        responseHeaders['content-type'] = 'text/plain; charset=utf-8;'
    } else if (isResponseBodyObject) {
      responseBody = JSON.stringify(responseBody)
  
      responseHeaders['content-length'] = responseBody.length.toString()
  
      if (!responseHeaders['content-type'])
        responseHeaders['content-type'] = 'application/json; charset=utf-8;'
  
      if (((responseBody as unknown) as { code: number }).code)
        responseCode = ((responseBody as unknown) as { code: number }).code
    }
  
    return new Response(responseBody as string, {
      headers: responseHeaders,
      status: responseCode
    })
  }

  /* -------------------------------------------------------------------------- */
  /* Routes                                                                     */
  /* -------------------------------------------------------------------------- */

  /* Add New Route ------------------------------------------------------------ */

  private addRoute(method: string, path: string, handler: (
    {
      body?: Schema,
      cookies?: ObjectSchema,
      headers?: ObjectSchema,
      query?: ObjectSchema
    } |
    // deno-lint-ignore no-explicit-any
    Handler<Environment, any, any, any, any, any>
  )[]) {
    const store = this.#router.register(path)

    store[method] = handler
  }

  /* Get Method --------------------------------------------------------------- */

  get<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl, undefined>[]
  ): this

  get<
    RequestUrl extends string,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      undefined,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  get<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        undefined,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('GET', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Delete Method ------------------------------------------------------------ */

  delete<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  delete<
    RequestUrl extends string,
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
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this
  
  delete<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('DELETE', this.#base ? this.#base + url : url, handler)

    return this
  }

  /* Post Method -------------------------------------------------------------- */

  post<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  post<
    RequestUrl extends string,
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
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this
  
  post<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('POST', this.#base ? this.#base + url : url, handler)
  
    return this
  }

  /* Put Method --------------------------------------------------------------- */

  put<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  put<
    RequestUrl extends string,
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
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this
  
  put<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('PUT', this.#base ? this.#base + url : url, handler)
  
    return this
  }

  /* Patch Method ------------------------------------------------------------- */

  patch<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  patch<
    RequestUrl extends string,
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
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this
  
  patch<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('PATCH', this.#base ? this.#base + url : url, handler)
  
    return this
  }

  /* Head Method -------------------------------------------------------------- */

  head<RequestUrl extends string>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl, undefined>[]
  ): this

  head<
    RequestUrl extends string,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
    },
    ...handler: Handler<
      Environment,
      RequestUrl,
      undefined,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >[]
  ): this

  head<
    RequestUrl extends string,
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
      } |
      Handler<
        Environment,
        RequestUrl,
        undefined,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    this.addRoute('HEAD', this.#base ? this.#base + url : url, handler)

    return this
  }
}
