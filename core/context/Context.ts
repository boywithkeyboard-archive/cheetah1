/// <reference types='../env.d.ts' />
import { RequestContext } from './RequestContext.ts'
import { ResponseContext } from './ResponseContext.ts'
import { ZodType } from '../deps.ts'
import { ObjectType } from '../_.ts'

export class Context<
  Params extends Record<string, unknown> = Record<string, never>,
  ValidatedBody extends ZodType = never,
  ValidatedCookies extends ObjectType = never,
  ValidatedHeaders extends ObjectType = never,
  ValidatedQuery extends ObjectType = never,
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
    env: Environment | undefined,
    ip: string | undefined,
    params: Record<string, string>,
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
    this.res = new ResponseContext()
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
