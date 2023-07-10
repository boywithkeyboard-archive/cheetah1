import { Context } from './context/Context.ts'
import { z, ZodObject, ZodRecord, ZodType } from './deps.ts'

export type ObjectType =
  // deno-lint-ignore no-explicit-any
  | ZodObject<any>
  | ZodRecord

export type Static<T extends ZodType | unknown> = T extends ZodType ? z.infer<T>
  : unknown

export type RequestMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'

export type Route =
  | {
    body?: ZodType
    cookies?: ObjectType
    headers?: ObjectType
    query?: ObjectType
    transform?: boolean
    cache?: false | { maxAge: number }
    cors?: string
  }
  // deno-lint-ignore no-explicit-any
  | Handler<any, any, any, any, any>
  // deno-lint-ignore no-explicit-any
  | DisembodiedHandler<any, any, any, any, any>

type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart

type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  // deno-lint-ignore ban-types
  : ExtractParam<Path, {}>

export type ResponsePayload =
  | ArrayBuffer
  | Blob
  | FormData
  | ReadableStream<unknown>
  | Record<string, unknown>
  | Uint8Array
  | string
  | undefined
  | void

export type Handler<
  Params,
  ParsedBody = unknown,
  ParsedCookies = unknown,
  ParsedHeaders = unknown,
  ParsedQuery = unknown,
> = (
  c: Context<
    ExtractParams<Params>,
    ParsedBody,
    ParsedCookies,
    ParsedHeaders,
    ParsedQuery
  >,
) => ResponsePayload | Promise<ResponsePayload>

type DisembodiedResponsePayload =
  | void
  | undefined

export type DisembodiedHandler<
  Params,
  ParsedBody = unknown,
  ParsedCookies = unknown,
  ParsedHeaders = unknown,
  ParsedQuery = unknown,
> = (
  c: Context<
    ExtractParams<Params>,
    ParsedBody,
    ParsedCookies,
    ParsedHeaders,
    ParsedQuery
  >,
) => DisembodiedResponsePayload | Promise<DisembodiedResponsePayload>
