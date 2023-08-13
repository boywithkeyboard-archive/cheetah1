// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getVariable } from '../x/env.ts'
import { verify as jwtVerify } from '../x/jwt.ts'

/**
 * Get the session token without verifying the session.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function getSessionToken(c: Context) {
  const header = c.req.headers.authorization

  if (!header || /^bearer\s[a-zA-Z0-9-_.]+$/.test(header) === false) {
    return
  }

  const token = header.split(' ')[1]

  const payload = await jwtVerify(
    token,
    getVariable(c, 'JWT_SECRET') ?? getVariable(c, 'jwt_secret') ??
      getVariable(c, 'jwtSecret'),
    { audience: 'oauth' },
  )

  if (payload) {
    return token
  }
}
