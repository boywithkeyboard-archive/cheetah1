// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { getNormalizedUser } from 'https://deno.land/x/authenticus@v2.0.3/getNormalizedUser.ts'
import { getUser } from 'https://deno.land/x/authenticus@v2.0.3/getUser.ts'
import { getToken } from 'https://deno.land/x/authenticus@v2.0.3/mod.ts'
import { Context } from '../context.ts'
import { Exception } from '../mod.ts'
import { getVariable } from '../x/env.ts'
import { sign, verify } from '../x/jwt.ts'
import { OAuthClient } from './client.ts'
import { UserAgent } from 'https://deno.land/std@0.198.0/http/user_agent.ts'
import ms from 'https://esm.sh/ms@2.1.3?target=es2022'
import { LocationData } from '../x/location_data.ts'

export async function handleCallback(
  c: Context,
  client: OAuthClient,
) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const payload = await verify<{
    ip?: string
    redirectUri: string
  }>(
    c.req.query.state,
    getVariable(c, 'JWT_SECRET'),
    { audience: 'oauth:sign_in' },
  )

  if (!payload || payload.ip !== c.req.ip) {
    throw new Exception('Access Denied')
  }

  const { accessToken } = await getToken(client.preset, {
    clientId: getVariable<string>(c, `${client.name.toUpperCase()}_CLIENT_ID`),
    clientSecret: getVariable<string>(
      c,
      `${client.name.toUpperCase()}_CLIENT_SECRET`,
    ),
    code: c.req.query.code,
    redirectUri: payload.redirectUri,
  })

  const user = getNormalizedUser(
    client.preset,
    // @ts-ignore:
    await getUser(client.preset, accessToken),
  )

  const sessionCode = crypto.randomUUID()

  const expiryDate = new Date(Date.now() + ms('7d'))

  const token = await sign({
    aud: 'oauth:session',
    exp: expiryDate,
    code: sessionCode,
    ip: c.req.ip,
  }, getVariable(c, 'JWT_SECRET'))

  const userAgent = new UserAgent(c.req.headers['user-agent'] ?? '')

  const location = new LocationData(c)

  c.__app.oauth.store.set(c, sessionCode, {
    email: user.email,
    method: client.name,
    userAgent: {
      browser: userAgent.browser,
      device: userAgent.device,
      os: userAgent.os,
    },
    location: {
      ip: c.req.ip,
      city: location.city,
      region: location.region,
      regionCode: location.regionCode,
      country: location.country,
      continent: location.continent,
    },
    expiresAt: expiryDate.getTime(),
  }, Math.round(ms('7d') / 1000))

  c.res.body = { token }

  return {
    sessionCode,
    token,
  }
}
