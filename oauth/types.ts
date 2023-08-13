import { UserAgent } from 'https://deno.land/std@0.198.0/http/user_agent.ts'
import { LocationData } from '../x/location_data.ts'

export type OAuthMethod =
  | 'google'
  | 'github'

export type OAuthSessionData = {
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
