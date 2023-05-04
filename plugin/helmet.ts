import { createPlugin } from '../createPlugin.ts'

export type HelmetSettings = {
  /**
   * Set the `Content-Security-Policy` header with a strict security policy.
   * 
   * @default
   * true
   */
  contentSecurityPolicy?: boolean

  /**
   * Set the `Cross-Origin-Embedder-Policy` header.
   * 
   * @default
   * null
   */
  crossOriginEmbedderPolicy?:
    | 'require-corp'
    | 'unsafe-none'
    | 'credentialless'
    | null
  
  /**
   * Set the `Cross-Origin-Opener-Policy` header.
   * 
   * @default
   * 'same-origin'
   */
  crossOriginOpenerPolicy?:
    | 'same-origin'
    | 'same-origin-allow-popups'
    | 'unsafe-none'
    | null
  
  /**
   * Set the `Cross-Origin-Resource-Policy` header.
   * 
   * @default
   * 'same-origin'
   */
  crossOriginResourcePolicy?:
    | 'same-origin'
    | 'same-site'
    | 'cross-origin'
    | null

  /**
   * Enable [DNS Prefetching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control) at the expense of your users' privacy.
   * 
   * @default
   * false
   */
  dnsPrefetching?: boolean

  /**
   * Set the `X-Frame-Options` header to mitigate Clickjacking.
   * 
   * @default
   * 'sameorigin'
   */
  noFraming?:
    | 'deny'
    | 'sameorigin'
    | null

  /**
   * Set the `Strict-Transport-Security` header, which indicates to browsers to prefer a secure HTTPS connection.
   * 
   * @default
   * {
   *   maxAge: 31536000, // a year
   *   includeSubDomains: true
   * }
   */
  hsts?: {
    maxAge?: number
    preload?: boolean
    includeSubDomains?: boolean
  } | null

  /**
   * Set the `X-Content-Type-Options` header to `nosniff`. This mitigates Content Sniffing, which can cause security vulnerabilities.
   * 
   * @default
   * true
   */
  noSniffing?: boolean

  /**
   * Set the `Origin-Agent-Cluster` header, which provides a mechanism to allow web applications to isolate their origins.
   * 
   * @default
   * true
   */
  originAgentCluster?: boolean

  /**
   * Set the `X-Permitted-Cross-Domain-Policies` header, which tells some clients (mostly Adobe products) your domain's policy for loading cross-domain content.
   * 
   * @default
   * 'none'
   */
  crossDomainPolicy?:
    | 'none'
    | 'master-only'
    | 'by-content-type'
    | 'all'
    | null

  /**
   * Set the `Referrer-Policy` header to control what information is set in the `Referer` header.
   * 
   * @default
   * 'no-referrer'
   */
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
  crossOriginEmbedderPolicy = null,
  crossOriginOpenerPolicy = 'same-origin',
  crossOriginResourcePolicy = 'same-origin',
  dnsPrefetching = false,
  noFraming = 'sameorigin',
  hsts = {
    maxAge: 31536000, // a year
    includeSubDomains: true
  },
  noSniffing = true,
  originAgentCluster = true,
  crossDomainPolicy = 'none',
  referrerPolicy = 'no-referrer'
} = {}) => ({
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
