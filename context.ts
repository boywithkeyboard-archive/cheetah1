// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { ZodType } from 'https://deno.land/x/zod@v3.21.4/types.ts'
import { RequestContext } from './request_context.ts'
import { ResponseContext } from './response_context.ts'
import { AppContext } from './cheetah.ts'
import { ObjectType, Payload } from './handler.ts'

export class Context<
  Params extends Record<string, unknown> = Record<string, unknown>,
  ValidatedBody extends ZodType | unknown = unknown,
  ValidatedCookies extends ObjectType | unknown = unknown,
  ValidatedHeaders extends ObjectType | unknown = unknown,
  ValidatedQuery extends ObjectType | unknown = unknown,
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

    this.#req = new RequestContext(this.#a, this.#p, this.#r, this.#s)

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
}
