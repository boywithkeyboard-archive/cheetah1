// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getVariable } from '../x/env.ts'
import { verify } from '../x/jwt.ts'
import { OAuthSessionData, OAuthSessionToken } from './types.ts'

/**
 * @namespace oauth
 * @since v1.3
 */
export async function getSessionData(
  c: Context,
): Promise<OAuthSessionData | undefined> {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const header = c.req.headers.authorization

  if (!header || /^bearer\s[a-zA-Z0-9-_.]+$/.test(header) === false) {
    return
  }

  const token = header.split(' ')[1]

  const payload = await verify<OAuthSessionToken>(
    token,
    getVariable(c, 'JWT_SECRET'),
    { audience: 'oauth:session' },
  )

  if (!payload) {
    return
  }

  const session = await c.__app.oauth.store.get(c, payload.identifier)

  return session
}
