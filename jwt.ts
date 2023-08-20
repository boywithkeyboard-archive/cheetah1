// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { decode } from 'https://deno.land/std@0.198.0/encoding/base64.ts'
import * as Jwt from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { Context } from './mod.ts'

interface Payload {
  iss?: string
  sub?: string
  aud?: string[] | string
  /**
   * A `Date` object or a `number` (in seconds) when the JWT will expire.
   */
  exp?: Date | number
  /**
   * A `Date` object or a `number` (in seconds) until which the JWT will be invalid.
   */
  nbf?: Date | number
  iat?: number
  jti?: string
  [key: string]: unknown
}

function importKey(key: string) {
  return crypto.subtle.importKey(
    'raw',
    decode(key).buffer,
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign', 'verify'],
  )
}

/**
 * Sign a payload.
 */
// deno-lint-ignore ban-types
export async function sign<T extends Record<string, unknown> = {}>(
  secret: string | Context,
  payload: T & Payload,
) {
  const key = typeof secret === 'string'
    ? await importKey(secret)
    : await importKey(
      (secret.env('jwt_secret') ?? secret.env('JWT_SECRET')) as string,
    )

  const { exp, nbf, ...rest } = payload

  return await Jwt.create({ alg: 'HS512', typ: 'JWT' }, {
    ...(exp && { exp: Jwt.getNumericDate(exp) }),
    ...(nbf && { nbf: Jwt.getNumericDate(nbf) }),
    ...rest,
  }, key)
}

/**
 * Verify the validity of a JWT.
 */
export async function verify<T extends Record<string, unknown> = Payload>(
  secret: string | Context,
  token: string,
  options?: Jwt.VerifyOptions,
) {
  try {
    const key = typeof secret === 'string'
      ? await importKey(secret)
      : await importKey(
        (secret.env('jwt_secret') ?? secret.env('JWT_SECRET')) as string,
      )

    return await Jwt.verify(token, key, options) as Jwt.Payload & T
  } catch (_err) {
    return
  }
}

export default {
  sign,
  verify,
}
