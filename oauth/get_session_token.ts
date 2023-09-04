// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { getCookies } from 'std/http/cookie.ts'
import { Context } from '../context.ts'
import { verify } from '../jwt.ts'

/**
 * Get the session token without verifying the session.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function getSessionToken(c: Context) {
  const cookies = getCookies(c.req.raw.headers)

  if (!cookies.token) {
    return
  }

  const payload = await verify(
    c,
    cookies.token,
    { audience: 'oauth:session' },
  )

  if (payload) {
    return cookies.token
  }
}
