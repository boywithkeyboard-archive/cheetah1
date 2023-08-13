// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { env } from '../x/env.ts'
import { verify as jwtVerify } from '../x/jwt.ts'

export async function getSessionData(
  c: Context,
): Promise<OAuthPayload | undefined> {
  const header = c.req.headers.authorization

  if (!header || /^bearer\s[a-zA-Z0-9-_.]+$/.test(header) === false) {
    return
  }

  const token = header.split(' ')[1]

  const e = env<{
    jwtSecret?: string
    jwt_secret?: string
    JWT_SECRET?: string
  }>(c)

  const payload = await jwtVerify<OAuthPayload>(
    token,
    e.jwtSecret ?? e.jwt_secret ?? e.JWT_SECRET as string,
    { audience: 'oauth' },
  )

  if (!payload) {
    return
  }

  return {
    sessionId: payload.sessionId,
    email: payload.email,
    method: payload.method,
    ip: payload.ip,
  }
}
