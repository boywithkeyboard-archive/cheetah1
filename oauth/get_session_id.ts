// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getVariable } from '../x/env.ts'
import { verify } from '../x/jwt.ts'
import { OAuthSessionToken } from './types.ts'

/**
 * Get the session identifier and verify it.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function getSessionId(c: Context): Promise<string | undefined> {
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
    getVariable(c, 'JWT_SECRET') ?? getVariable(c, 'jwt_secret') ??
      getVariable(c, 'jwtSecret'),
    { audience: 'oauth:session' },
  )

  if (!payload) {
    return
  }

  if (payload.ip !== c.req.ip) {
    await c.__app.oauth.store.delete(c, payload.identifier)

    if (typeof c.__app.oauth.onSignOut === 'function') {
      await c.__app.oauth.onSignOut(c, payload.identifier)
    }

    return
  }

  if (await c.__app.oauth.store.has(c, payload.identifier)) {
    return payload.identifier
  }
}
