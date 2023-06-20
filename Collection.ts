import { Handler, Route } from './Handler.d.ts'
import { ObjectSchema, Schema } from './validator/Validator.d.ts'

export class Collection {
  #cache:
    | false
    | {
      maxAge: number
    }
    | undefined

  #cors:
    | string
    | undefined

  routes: [
    string,
    string,
    Route[],
  ][]

  constructor({
    cache,
    cors,
  }: {
    /**
     * Duration in seconds for how long a response should be cached.
     *
     * @since v0.11
     */
    cache?:
      | false
      | {
        maxAge: number
      }
    /**
     * Enable Cross-Origin Resource Sharing (CORS) for this collection by setting a origin, e.g. `*`.
     *
     * @since v0.11
     */
    cors?: string
  } = {}) {
    this.routes = []

    this.#cache = cache
    this.#cors = cors
  }

  /* Get Method --------------------------------------------------------------- */

  get<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl, undefined>[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema,
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
    ValidatedCookies extends ObjectSchema,
    ValidatedHeaders extends ObjectSchema,
    ValidatedQuery extends ObjectSchema,
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
        undefined,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    if ((this.#cache || this.#cors) && typeof handler[0] !== 'function') {
      if (handler[0].cache === undefined && this.#cache !== undefined) {
        handler[0].cache = this.#cache
      }

      if (!handler[0].cors) {
        handler[0].cors = this.#cors
      }
    }

    this.routes.push(['GET', url, handler])

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
    ValidatedQuery extends ObjectSchema,
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
    ValidatedQuery extends ObjectSchema,
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
    if (this.#cors && typeof handler[0] !== 'function' && !handler[0].cors) {
      handler[0].cors = this.#cors
    }

    this.routes.push(['DELETE', url, handler])

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
    ValidatedQuery extends ObjectSchema,
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
    ValidatedQuery extends ObjectSchema,
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
    if (this.#cors && typeof handler[0] !== 'function' && !handler[0].cors) {
      handler[0].cors = this.#cors
    }

    this.routes.push(['POST', url, handler])

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
    ValidatedQuery extends ObjectSchema,
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
    ValidatedQuery extends ObjectSchema,
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
    if (this.#cors && typeof handler[0] !== 'function' && !handler[0].cors) {
      handler[0].cors = this.#cors
    }

    this.routes.push(['PUT', url, handler])

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
    ValidatedQuery extends ObjectSchema,
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
    ValidatedQuery extends ObjectSchema,
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
    if (this.#cors && typeof handler[0] !== 'function' && !handler[0].cors) {
      handler[0].cors = this.#cors
    }

    this.routes.push(['PATCH', url, handler])

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
    ValidatedQuery extends ObjectSchema,
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
    ValidatedQuery extends ObjectSchema,
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
        undefined,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ) {
    if (this.#cors && typeof handler[0] !== 'function' && !handler[0].cors) {
      handler[0].cors = this.#cors
    }

    this.routes.push(['HEAD', url, handler])

    return this
  }
}
