// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import * as brotli from 'https://deno.land/x/brotli@0.1.7/mod.ts'
import { deflate, gzip } from 'https://deno.land/x/foras@2.0.8/src/deno/mod.ts'
import { createExtension } from '../mod.ts'

/**
 * An extension to compress the body of the response with [Brotli](https://github.com/google/brotli), [gzip](https://www.gzip.org), or [deflate](https://www.ietf.org/rfc/rfc1951.txt), based on the `Accept-Encoding` header of the incoming request.
 *
 * @since v1.0
 */
export const compress = createExtension({
  onResponse({ c }) {
    const header = c.req.headers['accept-encoding']

    if (c.res.body === null || !header || header === 'identity') {
      return
    }

    if (header.includes('br')) {
      c.res.body = c.res.body instanceof Uint8Array
        ? brotli.compress(c.res.body)
        : c.res.body instanceof ArrayBuffer
        ? brotli.compress(new Uint8Array(c.res.body))
        : typeof c.res.body === 'string'
        ? brotli.compress(new TextEncoder().encode(c.res.body))
        : c.res.body

      if (c.res.body instanceof Uint8Array) {
        c.res.header('content-encoding', 'br')
      }
    } else if (header.includes('gzip')) {
      c.res.body = c.res.body instanceof Uint8Array
        ? gzip(c.res.body)
        : c.res.body instanceof ArrayBuffer
        ? gzip(new Uint8Array(c.res.body))
        : typeof c.res.body === 'string'
        ? gzip(new TextEncoder().encode(c.res.body))
        : c.res.body

      if (c.res.body instanceof Uint8Array) {
        c.res.header('content-encoding', 'gzip')
      }
    } else if (header.includes('deflate')) {
      c.res.body = c.res.body instanceof Uint8Array
        ? deflate(c.res.body)
        : c.res.body instanceof ArrayBuffer
        ? deflate(new Uint8Array(c.res.body))
        : typeof c.res.body === 'string'
        ? deflate(new TextEncoder().encode(c.res.body))
        : c.res.body

      if (c.res.body instanceof Uint8Array) {
        c.res.header('content-encoding', 'deflate')
      }
    }
  },
})
