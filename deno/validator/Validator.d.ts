import { z, ZodObject, ZodType } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { ZodRecord } from 'https://deno.land/x/zod@v3.21.4/types.ts'
import {
  Static as TypeBoxStatic,
  TObject,
  TRecord,
  TSchema,
} from 'https://esm.sh/@sinclair/typebox@0.28.15'
import { TypeBoxValidator } from './typebox.ts'
import { ZodValidator } from './zod.ts'

export type Validator =
  | TypeBoxValidator
  | ZodValidator

export type Schema =
  | TSchema
  | ZodType

export type ObjectSchema =
  | TObject
  | TRecord
  // deno-lint-ignore no-explicit-any
  | ZodObject<any>
  | ZodRecord

export type Static<
  T extends TSchema | ZodType,
> = T extends TSchema ? TypeBoxStatic<T>
  : T extends ZodType ? z.infer<T>
  : never
