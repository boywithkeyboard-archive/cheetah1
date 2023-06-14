[← other plugins](https://github.com/azurystudio/cheetah/blob/dev/guide/plugins/index.md)

## helmet

> This plugin is based on [express.js' helmet](https://github.com/helmetjs/helmet).

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.11.0/mod.ts'
import helmet from 'https://deno.land/x/cheetah@v0.11.0/plugins/helmet.ts'

const app = new cheetah()
  .use(helmet())
```

### Configuration

- `contentSecurityPolicy`

  Set the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) header with a strict security policy.

  ```ts
  // default behavior: (enabled)
  helmet({
    contentSecurityPolicy: true
  })
  ```

- `crossOriginEmbedderPolicy`

  Set the [Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy) header.

  ```ts
  helmet({
    crossOriginEmbedderPolicy: null // not set by default
  })
  ```

- `crossOriginOpenerPolicy`

  Set the [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy) header.

  ```ts
  helmet({
    contentSecurityPolicy: 'same-origin' // set to 'same-origin' by default
  })
  ```

- `crossOriginResourcePolicy`

  Set the [Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy) header.

  ```ts
  helmet({
    crossOriginResourcePolicy: 'same-origin' // set to 'same-origin' by default
  })
  ```

- `dnsPrefetching`

  Enable [DNS Prefetching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control) at the expense of your users' privacy.

  ```ts
  helmet({
    dnsPrefetching: false // disabled by default
  })
  ```

- `noFraming`

  Set the [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) header to mitigate [Clickjacking](https://developer.mozilla.org/en-US/docs/Glossary/Clickjacking).

  ```ts
  helmet({
    noFraming: 'sameorigin' // set to 'sameorigin' by default
  })
  ```

- `hsts`

  Set the [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) header, which indicates to browsers to prefer a secure HTTPS connection.

  ```ts
  helmet({
    contentSecurityPolicy: { // set with these options by default
      maxAge: 31536000, // a year
      includeSubDomains: true
    }
  })
  ```

- `noSniffing`

  Set the [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) header to `nosniff`. This mitigates [Content Sniffing](https://en.wikipedia.org/wiki/Content_sniffing), which can cause security vulnerabilities.

  ```ts
  helmet({
    noSniffing: true // enabled by default
  })
  ```

- `originAgentCluster`

  Set the [Origin-Agent-Cluster](https://whatpr.org/html/6214/origin.html#origin-keyed-agent-clusters) header, which provides a mechanism to allow web applications to isolate their origins.

  ```ts
  helmet({
    originAgentCluster: true // enabled by default
  })
  ```

- `crossDomainPolicy`

  Set the [X-Permitted-Cross-Domain-Policies](https://owasp.org/www-project-secure-headers/#x-permitted-cross-domain-policies) header, which tells some clients (mostly Adobe products) your domain's policy for loading cross-domain content.

  ```ts
  helmet({
    crossDomainPolicy: 'none' // set to 'none' by default
  })
  ```

- `referrerPolicy`

  Set the [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) header to control what information is set in the [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header.

  ```ts
  helmet({
    referrerPolicy: 'no-referrer' // set to 'no-referrer' by default
  })
  ```
