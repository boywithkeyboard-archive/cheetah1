// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { createAuthorizeUrl } from 'authenticus'
import { Context } from '../../contexts/context.ts'
import { sign } from '../jwt/jwt.ts'
import { OAuthClient } from './client.ts'
import { OAuthSignInToken } from '../../types/oauth.ts'

/**
 * Start the login flow by redirecting the user.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function signIn(
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

  const token = await sign<OAuthSignInToken>(
    c,
    {
      aud: 'oauth:sign_in',
      exp: 300, // 5m
      ip: c.req.ip,
      redirectUri: options.redirectUri,
    },
  )

  const url = createAuthorizeUrl(client.preset, {
    clientId: c.env(`${client.name.toUpperCase()}_CLIENT_ID`) ??
      c.env(`${client.name}_client_id`),
    scopes: options.scopes,
    state: token,
    redirectUri: options.redirectUri,
  })

  c.res.redirect(url)
}
