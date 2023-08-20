// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/// <reference types='./env.d.ts' />
import { ZodType } from 'https://deno.land/x/zod@v3.21.4/types.ts'
import { AppContext } from './cheetah.ts'
import { ObjectType, Payload } from './handler.ts'
import { RequestContext } from './request_context.ts'
import { ResponseContext } from './response_context.ts'

const HTTP_MESSAGES = {
  'Bad Request': 400,
  'Unauthorized': 401,
  'Access Denied': 403,
  'Not Found': 404,
  'Method Not Allowed': 405,
  'Not Acceptable': 406,
  'Request Timeout': 408,
  'Conflict': 409,
  'Gone': 410,
  'Length Required': 411,
  'Precondition Failed': 412,
  'Content Too Large': 413,
  'URI Too Long': 414,
  'Unsupported Media Type': 415,
  'Range Not Satisfiable': 416,
  'Expectation Failed': 417,
  'Teapot': 418,
  'Misdirected': 421,
  'Upgrade Required': 426,
  'Precondition Required': 428,
  'Rate Limit Exceeded': 429,
  'Regional Ban': 451,
  'Something Went Wrong': 500,
}

export class Context<
  Params extends Record<string, unknown> = Record<string, unknown>,
  ValidatedBody extends ZodType = never,
  ValidatedCookies extends ObjectType = never,
  ValidatedHeaders extends ObjectType = never,
  ValidatedQuery extends ObjectType = never,
> {
  #a
  #i
  #p
  #r
  #s
  #req:
    | RequestContext<
      Params,
      ValidatedBody,
      ValidatedCookies,
      ValidatedHeaders,
      ValidatedQuery
    >
    | undefined
  #res: ResponseContext | undefined
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
    p: Record<string, string | undefined>,
    r: Request,
    s: {
      body?: ZodType | undefined
      cookies?: ObjectType | undefined
      headers?: ObjectType | undefined
      query?: ObjectType | undefined
      [key: string]: unknown
    } | null,
    waitUntil: (promise: Promise<unknown>) => void,
  ) {
    this.#a = __app
    this.#i = __internal
    this.#p = p
    this.#r = r
    this.#s = s
    this.waitUntil = waitUntil
  }

  get __app(): AppContext {
    return this.#a
  }

  get dev(): boolean {
    return this.#a.debugging || this.runtime === 'deno' && Deno.env.get('DEV') === 'true'
  }

  env<T extends keyof Variables>(name: T): Variables[T] {
    return this.runtime === 'deno'
      ? Deno.env.get(name)
      : (this.#a.env as Variables)[name]
  }

  get req(): RequestContext<
    Params,
    ValidatedBody,
    ValidatedCookies,
    ValidatedHeaders,
    ValidatedQuery
  > {
    if (this.#req) {
      return this.#req
    }

    this.#req = new RequestContext(
      this.#a,
      this.#p,
      this.#r,
      this.#s,
      this.exception,
    )

    return this.#req
  }

  get res(): ResponseContext {
    if (this.#res) {
      return this.#res
    }

    this.#res = new ResponseContext(this.#i)

    return this.#res
  }

  get runtime() {
    return this.#a.runtime
  }

  exception(error: keyof typeof HTTP_MESSAGES, description?: string) {
    const code = HTTP_MESSAGES[error]

    return new Exception(error, description, code)
  }
}

/** @private */
export class Exception {
  public response

  constructor(
    error: string,
    description: string | undefined,
    code: number,
  ) {
    this.response = (request: Request) => {
      const a = request.headers.get('accept')

      const json = a
        ? a.indexOf('application/json') > -1 ||
          a.indexOf('*/*') > -1
        : false

      return new Response(
        json ? JSON.stringify({ error, description, code }) : error,
        {
          headers: {
            'content-type': `${
              json ? 'application/json' : 'text/plain'
            }; charset=utf-8;`,
          },
          status: code,
        },
      )
    }
  }
}
