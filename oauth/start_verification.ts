// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { createAuthorizeUrl } from 'https://deno.land/x/authenticus@v2.0.3/mod.ts'
import { Context } from '../context.ts'
import { getVariable } from '../x/env.ts'
import { sign } from '../x/jwt.ts'
import { OAuthClient } from './client.ts'
import { OAuthVerifyMethodToken } from './types.ts'

/**
 * Start the verification flow by redirecting the user.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function startVerification(
  c: Context,
  client: OAuthClient,
  options: {
    redirectUri: string
    scopes?: string[]
  },
) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const token = await sign<OAuthVerifyMethodToken>(
    {
      aud: 'oauth:verify_method',
      exp: 300, // 5m
      ip: c.req.ip,
      redirectUri: options.redirectUri,
    },
    getVariable(c, 'JWT_SECRET') ?? getVariable(c, 'jwt_secret') ??
      getVariable(c, 'jwtSecret'),
  )

  const url = createAuthorizeUrl(client.preset, {
    clientId: getVariable(c, `${client.name.toUpperCase()}_CLIENT_ID`) ??
      getVariable(c, `${client.name}_client_id`),
    scopes: options.scopes,
    state: token,
    redirectUri: options.redirectUri,
  })

  c.res.redirect(url)
}
