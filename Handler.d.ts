// deno-lint-ignore-file no-explicit-any
import { Context } from './Context.d.ts'
import { ObjectSchema, Schema } from './validator/Validator.d.ts'

export type Route =
  | {
    body?: Schema
    cookies?: ObjectSchema
    headers?: ObjectSchema
    query?: ObjectSchema
    transform?: boolean
    cache?: false | { maxAge: number }
    cors?: string
  }
  | Handler<any, any, any, any, any>
  | DisembodiedHandler<any, any, any, any, any>

type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart

type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  // deno-lint-ignore ban-types
  : ExtractParam<Path, {}>

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
  Params = unknown,
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
