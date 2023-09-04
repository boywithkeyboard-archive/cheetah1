// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { getCookies } from 'https://deno.land/std@0.200.0/http/cookie.ts'
import { Context } from '../context.ts'
import { verify } from '../jwt.ts'
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

  const cookies = getCookies(c.req.raw.headers)

  if (!cookies.token) {
    return
  }

  const payload = await verify<OAuthSessionToken>(
    c,
    cookies.token,
    { audience: 'oauth:session' },
  )

  if (!payload) {
    return
  }

  if (payload.ip !== c.req.ip) {
    await c.__app.oauth.store.delete(c, payload.identifier)

    c.res.deleteCookie('token', {
      path: c.__app.oauth.cookie?.path ?? '/',
      ...(c.__app.oauth.cookie?.domain &&
        { domain: c.__app.oauth.cookie.domain }),
    })

    if (typeof c.__app.oauth.onSignOut === 'function') {
      await c.__app.oauth.onSignOut(c, payload.identifier)
    }

    return
  }

  if (await c.__app.oauth.store.has(c, payload.identifier)) {
    return payload.identifier
  }
}
