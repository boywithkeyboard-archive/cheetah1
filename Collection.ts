import { ObjectSchema, Schema, Validator } from './validator/Validator.d.ts'
import { Handler, Route } from './Handler.d.ts'

export class Collection<
  V extends Validator | undefined = undefined
> {
  routes: [
    string,
    string,
    Route<V>[]
  ][]

  constructor() {
    this.routes = []
  }

  /* Get Method --------------------------------------------------------------- */

  get<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl, undefined>[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
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
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
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
    this.routes.push([ 'GET', url, handler ])

    return this
  }

  /* Delete Method ------------------------------------------------------------ */

  delete<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this
  
  delete<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
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
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
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
    this.routes.push([ 'DELETE', url, handler ])

    return this
  }

  /* Post Method -------------------------------------------------------------- */

  post<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this
  
  post<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
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
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
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
    this.routes.push([ 'POST', url, handler ])
  
    return this
  }

  /* Put Method --------------------------------------------------------------- */

  put<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this
  
  put<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
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
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
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
    this.routes.push([ 'PUT', url, handler ])
  
    return this
  }

  /* Patch Method ------------------------------------------------------------- */

  patch<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl>[]
  ): this
  
  patch<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      body?: ValidatedBody
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
      transform?: boolean
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
    ValidatedBody extends Schema<V>,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
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
    this.routes.push([ 'PATCH', url, handler ])
  
    return this
  }

  /* Head Method -------------------------------------------------------------- */

  head<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<RequestUrl, undefined>[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    schema: {
      cookies?: ValidatedCookies
      headers?: ValidatedHeaders
      query?: ValidatedQuery
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
    ValidatedCookies extends ObjectSchema<V>,
    ValidatedHeaders extends ObjectSchema<V>,
    ValidatedQuery extends ObjectSchema<V>
  >(
    url: RequestUrl,
    ...handler: (
      {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
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
    this.routes.push([ 'HEAD', url, handler ])

    return this
  }
}
