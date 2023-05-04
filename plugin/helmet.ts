import { createPlugin } from '../createPlugin.ts'

export type HelmetSettings = {
  contentSecurityPolicy?: boolean
  crossOriginEmbedderPolicy?:
    | 'require-corp'
    | 'unsafe-none'
    | 'credentialless'
    | null
  crossOriginOpenerPolicy?:
    | 'same-origin'
    | 'same-origin-allow-popups'
    | 'unsafe-none'
    | null
  crossOriginResourcePolicy?:
    | 'same-origin'
    | 'same-site'
    | 'cross-origin'
    | null
  dnsPrefetching?: boolean
  noFraming?:
    | 'deny'
    | 'sameorigin'
    | null
  hsts?: {
    maxAge?: number
    preload?: boolean
    includeSubDomains?: boolean
  } | null
  noSniffing?: boolean
  originAgentCluster?: boolean
  crossDomainPolicy?:
    | 'none'
    | 'master-only'
    | 'by-content-type'
    | 'all'
    | null
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | null
}

export const helmet = createPlugin<HelmetSettings>(({
  contentSecurityPolicy = true,
  crossOriginEmbedderPolicy = 'require-corp',
  crossOriginOpenerPolicy = 'same-origin',
  crossOriginResourcePolicy = 'same-origin',
  dnsPrefetching = false,
  noFraming = 'sameorigin',
  hsts = {
    maxAge: 15552000,
    includeSubDomains: true
  },
  noSniffing = true,
  originAgentCluster = true,
  crossDomainPolicy = 'none',
  referrerPolicy = 'no-referrer'
}) => ({
  beforeResponding(c) {
    if (contentSecurityPolicy)
      c.res.header('content-security-policy', `default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests`)

    if (crossOriginEmbedderPolicy !== null)
      c.res.header('cross-origin-embedder-policy', crossOriginEmbedderPolicy)

    if (crossOriginOpenerPolicy !== null)
      c.res.header('cross-origin-opener-policy', crossOriginOpenerPolicy)
    
    if (crossOriginResourcePolicy !== null)
      c.res.header('cross-origin-resource-policy', crossOriginResourcePolicy)

    if (dnsPrefetching !== null)
      c.res.header('x-dns-prefetch-control', dnsPrefetching ? 'on' : 'off')

    if (noFraming !== null)
      c.res.header('x-frame-options', noFraming.toUpperCase())

    if (hsts !== null)
      c.res.header(
        'strict-transport-security',
        Object.entries(hsts)
          .map(([key, value]) => `${key.replace('max-age', 'maxAge')}${typeof value === 'boolean' ? '' : `=${value}`}`)
          .join('; ')
      )

    if (noSniffing)
      c.res.header('x-content-type-options', 'nosniff')

    if (originAgentCluster)
      c.res.header('origin-agent-cluster', '?1')

    if (crossDomainPolicy !== null)
      c.res.header('x-permitted-cross-domain-policies', crossDomainPolicy)

    if (referrerPolicy)
      c.res.header('referrer-policy', 'no-referrer')
  }
}))
