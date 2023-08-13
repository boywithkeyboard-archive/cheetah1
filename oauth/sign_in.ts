// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { createAuthorizeUrl } from 'https://deno.land/x/authenticus@v2.0.3/mod.ts'
import { Context } from '../context.ts'
import { getVariable } from '../x/env.ts'
import { sign } from '../x/jwt.ts'
import { OAuthClient } from './client.ts'

/**
 * @since v1.3
 */
export async function signIn(
  c: Context,
  client: OAuthClient,
  options: {
    // TODO allowSignUp?: boolean
    redirectUri: string
    scopes?: string[]
  },
) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const token = await sign({
    aud: 'oauth:sign_in',
    exp: 900, // 15m
    ip: c.req.ip,
    redirectUri: options.redirectUri,
    allowSignUp: options.allowSignUp ?? true,
  }, getVariable(c, 'JWT_SECRET'))

  const url = createAuthorizeUrl(client.preset, {
    clientId: getVariable(c, `${client.name.toUpperCase()}_CLIENT_ID`),
    scopes: options.scopes,
    state: token,
    redirectUri: options.redirectUri,
  })

  c.res.redirect(url)
}
