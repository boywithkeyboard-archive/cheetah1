// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { UserAgent } from 'std/http/user_agent.ts'
import { LocationData } from '../location_data.ts'

export type OAuthMethod =
  | 'google'
  | 'github'

export type OAuthSessionData = {
  identifier: string
  email: string
  method: OAuthMethod
  userAgent: {
    browser?: UserAgent['browser']
    device?: UserAgent['device']
    os?: UserAgent['os']
  }
  location: {
    ip: string
    city?: LocationData['city']
    region?: LocationData['region']
    regionCode?: LocationData['regionCode']
    country?: LocationData['country']
    continent?: LocationData['continent']
  }
  expiresAt: number
}

export type OAuthSessionToken = {
  aud: 'oauth:session'
  identifier: string
  ip: string
}

export type OAuthSignInToken = {
  aud: 'oauth:sign_in'
  ip: string
  redirectUri: string
}
