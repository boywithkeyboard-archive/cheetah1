import { IncomingRequestCfProperties } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230321.0/index.ts'
import { Static as TypeBoxStatic, TObject, TSchema } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/typebox.d.ts'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/value/value.d.ts'
import { z, ZodObject, ZodType } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

export interface CloudflareRequest extends Request {
  cf: IncomingRequestCfProperties
}

export type RequestContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

export type Schema =
  | ZodType
  | TSchema

export type ObjectSchema =
  // deno-lint-ignore no-explicit-any
  | ZodObject<any>
  | TObject

export type Validator<T extends 'typebox' | 'zod'> = {
  check: T extends 'typebox'
    ? typeof Value.Check
    : undefined

  name: T
}

export type Static<T extends TSchema | ZodType> = T extends TSchema
  // deno-lint-ignore no-explicit-any
  ? (TypeBoxStatic<T> extends any ? unknown : TypeBoxStatic<T>)
  : T extends ZodType
  // deno-lint-ignore no-explicit-any
  ? (z.infer<T> extends any ? unknown : z.infer<T>)
  : unknown
