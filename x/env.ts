// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../mod.ts'

let ENV: Record<string, unknown> | undefined

export function env<Environment extends Record<string, unknown>>(
  c: Context,
): Environment {
  if (ENV) {
    return ENV as Environment
  }

  ENV = c.runtime === 'deno' ? Deno.env.toObject() : c.__app.env

  return ENV as Environment
}
