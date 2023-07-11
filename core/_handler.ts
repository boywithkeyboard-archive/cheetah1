import { Context } from '../mod.ts'
import { ObjectType } from './_zod.ts'
import { ZodString, ZodType } from './deps.ts'

type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart

type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  // deno-lint-ignore ban-types
  : ExtractParam<Path, {}>

export type Payload =
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
  next: () => void,
) => Payload | Promise<Payload>

export function handler<T>() {
  return <
    Pathname extends `/${string}`,
    ValidatedBody extends ObjectType | ZodString,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    // deno-lint-ignore no-unused-vars
    pathname: Pathname,
    // deno-lint-ignore no-unused-vars
    ...handler: (
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        transform?: boolean
        cache?: false | { maxAge: number }
        cors?: string
      }
      | Handler<
        Pathname,
        ValidatedBody,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ): T => {
    return null as T
  }
}

export type BodylessHandler<
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
  next: () => void,
) => Payload | Promise<Payload>

export function bodylessHandler<T>() {
  return <
    Pathname extends `/${string}`,
    ValidatedCookies extends ObjectType,
    ValidatedHeaders extends ObjectType,
    ValidatedQuery extends ObjectType,
  >(
    // deno-lint-ignore no-unused-vars
    pathname: Pathname,
    // deno-lint-ignore no-unused-vars
    ...handler: (
      | {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cache?: false | { maxAge: number }
        cors?: string
      }
      | BodylessHandler<
        Pathname,
        never,
        ValidatedCookies,
        ValidatedHeaders,
        ValidatedQuery
      >
    )[]
  ): T => {
    return null as T
  }
}

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
  | Handler<unknown>
  | BodylessHandler<unknown>
