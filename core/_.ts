// deno-lint-ignore-file no-explicit-any
import { Context } from './context/Context.ts'
import { ZodObject, ZodRecord, ZodType } from './deps.ts'

export type ObjectType =
  | ZodObject<any>
  | ZodRecord

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
  | Handler<any>
  | DisembodiedHandler<any>

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
  ParsedBody extends ZodType = never,
  ParsedCookies extends ObjectType = never,
  ParsedHeaders extends ObjectType = never,
  ParsedQuery extends ObjectType = never,
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
  ParsedBody extends ZodType = never,
  ParsedCookies extends ObjectType = never,
  ParsedHeaders extends ObjectType = never,
  ParsedQuery extends ObjectType = never,
> = (
  c: Context<
    ExtractParams<Params>,
    ParsedBody,
    ParsedCookies,
    ParsedHeaders,
    ParsedQuery
  >,
) => DisembodiedResponsePayload | Promise<DisembodiedResponsePayload>
