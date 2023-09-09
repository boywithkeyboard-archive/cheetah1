// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import type {
  ZodObject,
  ZodRecord,
  ZodString,
  ZodType,
  ZodTypeDef,
  ZodUnion,
} from 'zod'
import type { Context } from '../contexts/context.ts'

export type ObjectType =
  // deno-lint-ignore no-explicit-any
  | ZodObject<any>
  | ZodRecord

export type BaseType<T extends ZodTypeDef = ZodTypeDef> =
  // deno-lint-ignore no-explicit-any
  ZodType<any, T, any>

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

type Number = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Version = `v${
  | Exclude<Number, 0>
  | `${Exclude<Number, 0>}${Number}`}`

export type VersionRange =
  | Version // exact version
  | `> ${Version}` // greater than version
  | `< ${Version}` // smaller than version
  | `>= ${Version}` // greater than or equal to version
  | `<= ${Version}` // smaller than or equal to version
  | `${Version}...${Version}` // from (min) ... to (max)

export type Handler<
  Pathname extends `/${string}` | unknown,
  // deno-lint-ignore no-explicit-any
  ParsedBody extends ObjectType | ZodString | ZodUnion<any> = never,
  ParsedCookies extends ObjectType = never,
  ParsedHeaders extends ObjectType = never,
  ParsedQuery extends ObjectType = never,
> = (
  c: Context<
    ExtractParams<Pathname>,
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
    // deno-lint-ignore no-explicit-any
    ValidatedBody extends ObjectType | ZodString | ZodUnion<any> = never,
    ValidatedCookies extends ObjectType = never,
    ValidatedHeaders extends ObjectType = never,
    ValidatedQuery extends ObjectType = never,
  >(
    // deno-lint-ignore no-unused-vars
    pathname: Pathname,
    // deno-lint-ignore no-unused-vars
    ...handler: (
      | ({
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cors?: string
        params?: Partial<Record<keyof ExtractParams<Pathname>, ZodType>>
        gateway?: VersionRange
      })
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
  Pathname extends `/${string}` | unknown,
  // deno-lint-ignore no-explicit-any
  ParsedBody extends ObjectType | ZodString | ZodUnion<any> = never,
  ParsedCookies extends ObjectType = never,
  ParsedHeaders extends ObjectType = never,
  ParsedQuery extends ObjectType = never,
> = (
  c: Context<
    ExtractParams<Pathname>,
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
    ValidatedCookies extends ObjectType = never,
    ValidatedHeaders extends ObjectType = never,
    ValidatedQuery extends ObjectType = never,
  >(
    // deno-lint-ignore no-unused-vars
    pathname: Pathname,
    // deno-lint-ignore no-unused-vars
    ...handler: (
      | {
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        cors?: string
        params?: Partial<Record<keyof ExtractParams<Pathname>, ZodType>>
        gateway?: VersionRange
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

export type HandlerOrSchema =
  | {
    body?: ZodType
    cookies?: ObjectType
    headers?: ObjectType
    query?: ObjectType
    cors?: string
    params?: Record<string, ZodType>
    gateway?: VersionRange
  }
  | Handler<unknown>
  | BodylessHandler<unknown>
