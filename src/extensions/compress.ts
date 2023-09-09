// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { compress as brotli } from 'brotli'
import { deflate, gzip, initBundledOnce, InitOutput } from 'foras'
import { createExtension } from './extension.ts'

type CompressionAlgorithm = {
  format: 'br' | 'deflate' | 'gzip'
  compress: (input: Uint8Array) => Uint8Array | Promise<Uint8Array>
}

let FORAS: InitOutput | undefined

export const BROTLI: CompressionAlgorithm = {
  format: 'br',
  compress: brotli,
}

export const DEFLATE: CompressionAlgorithm = {
  format: 'deflate',
  async compress(input) {
    if (!FORAS) {
      FORAS = await initBundledOnce()
    }

    return deflate(input)
  },
}

export const GZIP: CompressionAlgorithm = {
  format: 'gzip',
  async compress(input) {
    if (!FORAS) {
      FORAS = await initBundledOnce()
    }

    return gzip(input)
  },
}

/**
 * An extension to compress the body of the response with [brotli](https://github.com/google/brotli), [gzip](https://www.gzip.org), or [deflate](https://www.ietf.org/rfc/rfc1951.txt), based on the `Accept-Encoding` header of the incoming request.
 *
 * @since v1.0
 */
export const compress = createExtension<{
  algorithm: CompressionAlgorithm | CompressionAlgorithm[]
}>({
  async onResponse({ c, _ }) {
    const alg = _.algorithm instanceof Array ? _.algorithm : [_.algorithm]

    const header = c.req.headers['accept-encoding']

    if (c.res.body === null || !header || header === 'identity') {
      return
    }

    for (let i = 0; i < alg.length; ++i) {
      if (!header.includes(alg[i].format)) {
        continue
      }

      c.res.body = c.res.body instanceof Uint8Array
        ? await alg[i].compress(c.res.body)
        : c.res.body instanceof ArrayBuffer
        ? await alg[i].compress(new Uint8Array(c.res.body))
        : typeof c.res.body === 'string'
        ? await alg[i].compress(new TextEncoder().encode(c.res.body))
        : c.res.body

      if (c.res.body instanceof Uint8Array) {
        c.res.header('content-encoding', alg[i].format)
      }

      break
    }
  },
})
