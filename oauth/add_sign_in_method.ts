// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { env } from '../x/env.ts'
import { sign } from '../x/jwt.ts'
import { OAuthClient } from './oauth_client.ts'
import { SessionData } from './types.ts'

export async function addSignInMethod(
  c: Context,
  client: OAuthClient,
  options?: { allowSignUp?: boolean },
) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const sessionId = crypto.randomUUID()

  const e = env<{
    jwtSecret?: string
    jwt_secret?: string
    JWT_SECRET?: string
  }>(c)

  const token = await sign({
    aud: 'oauth:add_method',
    exp: 86400,
    sid: sessionId,
    ip: c.req.ip,
  }, e.jwtSecret ?? e.jwt_secret ?? e.JWT_SECRET as string)

  c.res.body = { token }

  return {
    sessionId,
    token,
  }
}
