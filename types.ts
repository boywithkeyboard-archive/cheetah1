/// <reference types='./env.d.ts' />

import { z, ZodObject, ZodType } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { TObject, TSchema, Static as TypeBoxStatic } from 'https://esm.sh/@sinclair/typebox@0.28.9'
import typebox from './validator/typebox.ts'
import zod from './validator/zod.ts'

/* Config ------------------------------------------------------------------- */

export type Config<
  V extends Validator | unknown = unknown
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

/* Request ------------------------------------------------------------------ */

export type RequestContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

/* Validator ---------------------------------------------------------------- */

export type Validator = typeof typebox | typeof zod

export type Schema<
  V extends Validator | unknown = unknown
> = V extends typeof typebox
  ? TSchema
  : V extends typeof zod
  ? ZodType
  : (ZodType | TSchema)

export type ObjectSchema<
  V extends Validator | unknown = unknown
> = V extends undefined
  ? never
  : V extends typeof typebox
  ? TObject
  : V extends typeof zod
  // deno-lint-ignore no-explicit-any
  ? ZodObject<any>
  // deno-lint-ignore no-explicit-any
  : (ZodObject<any> | TObject)

export type Static<T extends TSchema | ZodType> = T extends undefined
  ? never
  : T extends TSchema
  ? TypeBoxStatic<T>
  : T extends ZodType
  ? z.infer<T>
  : unknown

/* Handler ------------------------------------------------------------------ */

type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart

type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  // deno-lint-ignore ban-types
  : ExtractParam<Path, {}> // < must be {}

export type ResponsePayload =
  | string
  | Record<string, unknown>
  | void
  | undefined

export type Handler<
  Params = unknown,
  ParsedBody = unknown,
  ParsedCookies = unknown,
  ParsedHeaders = unknown,
  ParsedQuery = unknown
> = (
  c: Context<
    ExtractParams<Params>, ParsedBody, ParsedCookies, ParsedHeaders, ParsedQuery
  >
) => ResponsePayload | Promise<ResponsePayload>

type DisembodiedResponsePayload =
  | void
  | undefined

export type DisembodiedHandler<
  Params = unknown,
  ParsedBody = unknown,
  ParsedCookies = unknown,
  ParsedHeaders = unknown,
  ParsedQuery = unknown
> = (
  c: Context<
    ExtractParams<Params>, ParsedBody, ParsedCookies, ParsedHeaders, ParsedQuery
  >
) => DisembodiedResponsePayload | Promise<DisembodiedResponsePayload>

/* Context ------------------------------------------------------------------ */

export type Context<
  Params extends Record<string, unknown> = Record<string, never>,
  ValidatedBody extends Schema | unknown = unknown,
  ValidatedCookies extends ObjectSchema | unknown = unknown,
  ValidatedHeaders extends ObjectSchema | unknown = unknown,
  ValidatedQuery extends ObjectSchema | unknown = unknown
> = {
  /**
   * A method to retrieve the value of a environment variable.
   */
  env: Environment

  runtime:
    | 'cloudflare'
    | 'deno'

  /**
   * Wait until a response is sent to the client, then resolve the promise.
   */
  waitUntil: (promise: Promise<unknown>) => void

  req: {
    ip?: string

    /**
     * Retrieve the unmodified request object with an unread stream of the body.
     */
    raw: () => Request

    /**
     * The validated body of the incoming request.
     */
    body: ValidatedBody extends Schema ? Static<ValidatedBody> : ValidatedBody,

    /**
     * The validated cookies of the incoming request.
     */
    cookies: ValidatedCookies extends ObjectSchema ? Static<ValidatedCookies> : ValidatedCookies

    /**
     * The validated headers of the incoming request.
     */
    headers: ValidatedHeaders extends ObjectSchema ? Static<ValidatedHeaders> : ValidatedHeaders

    /**
     * A method to retrieve the corresponding value of a parameter.
     */
    param: <T extends keyof Params>(param: T) => Params[T]

    /**
     * The validated query parameters of the incoming request.
     */
    query: ValidatedQuery extends ObjectSchema ? Static<ValidatedQuery> : ValidatedQuery

    /**
     * Parse the request body as an `ArrayBuffer` with a set time limit in milliseconds *(defaults to 3000)*.
     */
    buffer: (deadline?: number) => Promise<ArrayBuffer | null>

    /**
     * Parse the request body as a `Blob` with a set time limit in milliseconds *(defaults to 3000)*.
     */
    blob: (deadline?: number) => Promise<Blob | null>

    /**
     * Parse the request body as a `FormData` with a set time limit in milliseconds *(defaults to 3000)*.
     */
    formData: (deadline?: number) => Promise<FormData | null>

    /**
     * Get a readable stream of the request body.
     */
    stream: () => ReadableStream | null

    /**
     * A method to retrieve the geo-location data of the incoming request *(works only on Cloudflare Workers)*.
     */
    geo: () => {
      city?: string
      region?: string
      country?: string
      continent?: string
      regionCode?: string
      latitude?: string
      longitude?: string
      postalCode?: string
      timezone?: string
      datacenter?: string
    }
  }

  res: {
    /**
     * Set the status code of the response.
     */
    code: (code: number) => void

    /**
     * Attach a cookie to the response.
     */
    cookie: (
      name: string,
      value: string,
      options?: {
        expiresAt?: Date
        maxAge?: number
        domain?: string
        path?: string
        secure?: boolean
        httpOnly?: boolean
        sameSite?:
          | 'strict'
          | 'lax'
          | 'none'
      }
    ) => void

    /**
     * Attach a header to the response.
     */
    header: (name: string, value: string) => void

    /**
     * Redirect the incoming request. *(temporary redirect by default)*
     */
    redirect: (destination: string, code?: number) => void

    blob: (blob: Blob | File, code?: number) => void

    stream: (stream: ReadableStream<unknown>, code?: number) => void

    formData: (formData: FormData, code?: number) => void

    buffer: (buffer: Uint8Array | ArrayBuffer, code?: number) => void

    json: (json: Record<string, unknown>, code?: number) => void

    text: (text: string, code?: number) => void
  }

  [key: string]: unknown
}

/* Plugin ------------------------------------------------------------------- */

export type PluginMethods = {
  beforeParsing?: (request: Request) => void | Promise<void>
  beforeHandling?: (c: Context<Record<string, never>, unknown, unknown, Record<string, string>, unknown>) => ResponsePayload | Promise<ResponsePayload>
  beforeResponding?: (c: Context<Record<string, never>, unknown, unknown, Record<string, string>, unknown>) => ResponsePayload | Promise<ResponsePayload>
}

export type Plugin<Settings extends Record<string, unknown> | undefined = undefined> =
  Settings extends undefined ? PluginMethods : ((settings?: Settings) => PluginMethods)

/* Route -------------------------------------------------------------------- */

export type Route<V extends Validator | undefined> =
  | {
      body?: Schema<V>
      cookies?: ObjectSchema<V>
      headers?: ObjectSchema<V>
      query?: ObjectSchema<V>
      transform?: boolean
    }
  // deno-lint-ignore no-explicit-any
  | Handler<any, any, any, any, any>
