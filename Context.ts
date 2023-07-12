import { ZodType } from 'https://deno.land/x/zod@v3.21.4/types.ts'
import { RequestContext } from './RequestContext.ts'
import { ResponseContext } from './ResponseContext.ts'
import { AppContext } from './cheetah.ts'
import { ObjectType, Payload } from './handler.ts'

type Environment = {}

export class Context<
  Params extends Record<string, unknown> = Record<string, never>,
  ValidatedBody extends ZodType | unknown = unknown,
  ValidatedCookies extends ObjectType | unknown = unknown,
  ValidatedHeaders extends ObjectType | unknown = unknown,
  ValidatedQuery extends ObjectType | unknown = unknown,
> {
  #a
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
    __app: AppContext,
    __internal: {
      b: Exclude<Payload, void> | null
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
    this.#a = __app
    this.#e = env
    this.#r = runtime
    this.req = new RequestContext(ip, params, request, runtime, schema)
    this.res = new ResponseContext(__internal)
    this.waitUntil = waitUntil
  }

  get __app(): AppContext {
    return this.#a
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
