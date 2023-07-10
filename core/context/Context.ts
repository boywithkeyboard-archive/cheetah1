/// <reference types='../env.d.ts' />
import { RequestContext } from './RequestContext.ts'
import { ResponseContext } from './ResponseContext.ts'
import { ZodType } from '../deps.ts'
import { ObjectType } from '../_.ts'

export class Context<
  Params extends Record<string, unknown> = Record<string, never>,
  ValidatedBody extends ZodType | unknown = unknown,
  ValidatedCookies extends ObjectType | unknown = unknown,
  ValidatedHeaders extends ObjectType | unknown = unknown,
  ValidatedQuery extends ObjectType | unknown = unknown,
> {
  #e
  #r
  req: RequestContext<
    Params,
    ValidatedBody,
    ValidatedCookies,
    ValidatedHeaders,
    ValidatedQuery
  >
  res: ResponseContext
  /**
   * Wait until the response is sent to the client, then resolve the promise.
   */
  waitUntil: (promise: Promise<unknown>) => void

  constructor(
    __internal: {
      c: number
      h: Headers
    },
    env: Environment | undefined,
    ip: string | undefined,
    params: Record<string, string | undefined>,
    request: Request,
    runtime:
      | 'cloudflare'
      | 'deno',
    schema: {
      body?: ZodType | undefined
      cookies?: ObjectType | undefined
      headers?: ObjectType | undefined
      query?: ObjectType | undefined
      [key: string]: unknown
    },
    waitUntil: (promise: Promise<unknown>) => void,
  ) {
    this.#e = env
    this.#r = runtime
    this.req = new RequestContext(ip, params, request, runtime, schema)
    this.res = new ResponseContext(__internal)
    this.waitUntil = waitUntil
  }

  get env() {
    if (!this.#e) {
      this.#e = Deno.env.toObject()
    }

    return this.#e
  }

  get runtime() {
    return this.#r
  }
}
