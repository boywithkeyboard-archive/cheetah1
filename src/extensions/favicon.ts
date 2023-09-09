// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { createExtension } from './extension.ts'

let FAVICON: ArrayBuffer | Uint8Array | undefined

/**
 * An extension to set a neat [favicon](https://en.wikipedia.org/wiki/Favicon) for your app.
 *
 * The source for your favicon can be either a URL or a buffer.
 *
 * @since v1.1
 */
export const favicon = createExtension<{
  headers?: Record<string, string>
  source: string | ArrayBuffer | Uint8Array
}>({
  async onRequest({
    req,
    _: {
      headers,
      source,
    },
  }) {
    const parts = req.url.split('?')

    parts[0] = parts[0].slice(8)

    const pathname = parts[0].substring(parts[0].indexOf('/'))

    if (pathname !== '/favicon.ico') {
      return
    }

    if (!FAVICON) {
      if (typeof source === 'string') {
        const response = await fetch(source)

        FAVICON = await response.arrayBuffer()
      } else {
        FAVICON = source
      }
    }

    return new Response(FAVICON, {
      headers,
    })
  },
})
