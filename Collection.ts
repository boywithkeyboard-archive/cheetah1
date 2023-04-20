import { Handler, ObjectSchema, Schema } from './types.ts'
import typebox from './validator/typebox.ts'
import zod from './validator/zod.ts'

export class Collection<
  Environment extends Record<string, string> = Record<string, string>,
  Validator extends (typeof typebox | typeof zod) | undefined = undefined
> {
  routes: [
    string,
    string,
    (
      {
        body?: Schema<Validator>,
        cookies?: ObjectSchema<Validator>,
        headers?: ObjectSchema<Validator>,
        query?: ObjectSchema<Validator>
      } |
      // deno-lint-ignore no-explicit-any
      Handler<Environment, any, any, any, any, any>
    )[]
  ][]

  constructor() {
    this.routes = []
  }

  /* Get Method --------------------------------------------------------------- */

  get<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl, undefined>[]
  ): this

  get<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'GET', url, handler ])

    return this
  }

  /* Delete Method ------------------------------------------------------------ */

  delete<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  delete<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'DELETE', url, handler ])

    return this
  }

  /* Post Method -------------------------------------------------------------- */

  post<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  post<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'POST', url, handler ])
  
    return this
  }

  /* Put Method --------------------------------------------------------------- */

  put<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  put<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'PUT', url, handler ])
  
    return this
  }

  /* Patch Method ------------------------------------------------------------- */

  patch<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl>[]
  ): this
  
  patch<
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedBody extends Schema<Validator>,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'PATCH', url, handler ])
  
    return this
  }

  /* Head Method -------------------------------------------------------------- */

  head<RequestUrl extends `/${string}`>(
    url: RequestUrl,
    ...handler: Handler<Environment, RequestUrl, undefined>[]
  ): this

  head<
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    RequestUrl extends `/${string}`,
    ValidatedCookies extends ObjectSchema<Validator>,
    ValidatedHeaders extends ObjectSchema<Validator>,
    ValidatedQuery extends ObjectSchema<Validator>
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
    this.routes.push([ 'HEAD', url, handler ])

    return this
  }
}
