// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import {
  decode,
  encode,
} from 'https://deno.land/std@0.199.0/encoding/base64.ts'
import {
  create,
  getNumericDate,
  Payload as JwtPayload,
  verify as _verify,
  VerifyOptions,
} from 'https://deno.land/x/djwt@v2.8/mod.ts'

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

/**
 * @deprecated will be removed at v2.0!
 */
export async function createKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign', 'verify'],
  )

  const exportedKey = await crypto.subtle.exportKey('raw', key)

  return encode(exportedKey)
}

/**
 * @deprecated will be removed at v2.0!
 */
export function importKey(key: string) {
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
 *
 * @deprecated please import the module from `https://deno.land/x/cheetah@v1.4.0/mod.ts` instead!
 *
 * ```ts
 * import { jwt } from 'https://deno.land/x/cheetah@v1.4.0/mod.ts'
 *
 * await jwt.sign(...)
 * ```
 */
// deno-lint-ignore ban-types
export async function sign<T extends Record<string, unknown> = {}>(
  payload: T & Payload,
  secret: string | CryptoKey,
) {
  const key = typeof secret === 'string' ? await importKey(secret) : secret

  const { exp, nbf, ...rest } = payload

  return await create({ alg: 'HS512', typ: 'JWT' }, {
    ...(exp && { exp: getNumericDate(exp) }),
    ...(nbf && { nbf: getNumericDate(nbf) }),
    ...rest,
  }, key)
}

/**
 * Verify the validity of a JWT.
 *
 * @deprecated please import the module from `https://deno.land/x/cheetah@v1.4.0/mod.ts` instead!
 *
 * ```ts
 * import { jwt } from 'https://deno.land/x/cheetah@v1.4.0/mod.ts'
 *
 * await jwt.verify(...)
 * ```
 */
export async function verify<T extends Record<string, unknown> = Payload>(
  token: string,
  secret: string | CryptoKey,
  options?: VerifyOptions,
) {
  try {
    const key = typeof secret === 'string' ? await importKey(secret) : secret

    return await _verify(token, key, options) as JwtPayload & T
  } catch (_err) {
    return
  }
}

/**
 * @deprecated please import the module from `https://deno.land/x/cheetah@v1.4.0/mod.ts` instead!
 *
 * ```ts
 * import { jwt } from 'https://deno.land/x/cheetah@v1.4.0/mod.ts'
 * ```
 */
export default {
  sign,
  verify,
}
