import {
  z,
  ZodObject,
  ZodObjectDef,
  ZodRecord,
  ZodStringDef,
  ZodType,
} from './deps.ts'

export type ObjectType =
  // deno-lint-ignore no-explicit-any
  | ZodObject<any>
  | ZodRecord

export type Static<T extends ZodType | unknown> = T extends ZodType ? z.infer<T>
  : unknown

export type BaseType =
  // deno-lint-ignore no-explicit-any
  | ZodType<any, ZodObjectDef<any, any, any>, any>
  // deno-lint-ignore no-explicit-any
  | ZodType<any, ZodStringDef, any>
