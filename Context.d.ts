/// <reference types='./env.d.ts' />

import { ContinentCode } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230511.0/index.ts'
import { ObjectSchema, Schema, Static } from './validator/Validator.d.ts'

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
      continent?: ContinentCode
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
