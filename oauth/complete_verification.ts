// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import {
  getNormalizedUser,
  getToken,
  getUser,
} from 'https://deno.land/x/authenticus@v2.0.3/mod.ts'
import { Context } from '../context.ts'
import { Exception } from '../exception.ts'
import { getVariable } from '../x/env.ts'
import { verify } from '../x/jwt.ts'
import { OAuthClient } from './client.ts'
import { OAuthSignInToken } from './types.ts'

/**
 * Complete the verification flow.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function completeVerification(
  c: Context,
  client: OAuthClient,
) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  // validate request

  if (
    typeof c.req.query.state !== 'string' ||
    typeof c.req.query.code !== 'string'
  ) {
    throw new Exception('Bad Request')
  }

  // validate state

  const payload = await verify<OAuthSignInToken>(
    c.req.query.state,
    getVariable(c, 'JWT_SECRET'),
    { audience: 'oauth:verify_method' },
  )

  if (!payload || payload.ip !== c.req.ip) {
    throw new Exception('Access Denied')
  }

  // fetch user

  const { accessToken } = await getToken(client.preset, {
    clientId: getVariable(c, `${client.name.toUpperCase()}_CLIENT_ID`) ??
      getVariable(c, `${client.name}_client_id`) as string,
    clientSecret:
      getVariable(c, `${client.name.toUpperCase()}_CLIENT_SECRET`) ??
        getVariable(c, `${client.name}_client_secret`) as string,
    code: c.req.query.code,
    redirectUri: payload.redirectUri,
  })

  const user = getNormalizedUser(
    client.preset,
    // @ts-ignore:
    await getUser(client.preset, accessToken),
  )

  return user
}
