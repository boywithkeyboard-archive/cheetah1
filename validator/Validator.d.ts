import { z, ZodObject, ZodType } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { TObject, TSchema, Static as TypeBoxStatic } from 'https://esm.sh/@sinclair/typebox@0.28.9'
import typebox from './typebox.ts'
import zod from './zod.ts'

export type Validator = typeof typebox | typeof zod

export type Schema<
  V extends Validator | unknown = unknown
> = V extends typeof typebox
  ? TSchema
  : V extends typeof zod
  ? ZodType
  : (ZodType | TSchema)

export type ObjectSchema<
  V extends Validator | unknown = unknown
> = V extends undefined
  ? never
  : V extends typeof typebox
  ? TObject
  : V extends typeof zod
  // deno-lint-ignore no-explicit-any
  ? ZodObject<any>
  // deno-lint-ignore no-explicit-any
  : (ZodObject<any> | TObject)

export type Static<T extends TSchema | ZodType> = T extends undefined
  ? never
  : T extends TSchema
  ? TypeBoxStatic<T>
  : T extends ZodType
  ? z.infer<T>
  : unknown
