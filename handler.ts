// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { ZodTypeDef, ZodUnion } from 'https://deno.land/x/zod@v3.21.4/index.ts'
import {
  ZodObject,
  ZodRecord,
  ZodString,
  ZodType,
} from 'https://deno.land/x/zod@v3.21.4/types.ts'
import { Context } from './mod.ts'

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

export type Handler<
  Pathname extends `/${string}`,
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
      | {
        body?: ValidatedBody
        cookies?: ValidatedCookies
        headers?: ValidatedHeaders
        query?: ValidatedQuery
        /** @deprecated please pass this option to the `c.req.body()` method! */
        transform?: boolean // TODO remove at v2.0
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
  Pathname extends `/${string}`,
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
    /** @deprecated please pass this option to the `c.req.body()` method! */
    transform?: boolean // TODO remove at v2.0
    cors?: string
  }
  // deno-lint-ignore no-explicit-any
  | Handler<any>
  // deno-lint-ignore no-explicit-any
  | BodylessHandler<any>
