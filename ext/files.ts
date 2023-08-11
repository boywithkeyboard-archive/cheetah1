// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { R2Bucket } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230801.0/index.ts'
import { join } from 'https://deno.land/std@0.197.0/path/mod.ts'
import { createExtension } from '../extensions.ts'

// An extension to serve static files from Cloudflare R2, an S3 bucket, or the local file system.

/**
 * An extension to serve static files from Cloudflare R2 or the local file system.
 *
 * @since v1.2
 */
export const files = createExtension<{
  serve:
    & {
      cacheControl?: string
      etag?: boolean
    }
    & (
      | {
        directory: string
        type?: 'fs'
      }
      | {
        name: string
        type: 'r2'
      }
    )
  // | {
  //   endpoint: string
  //   bucketName: string
  //   accessKeyId: string
  //   secretAccessKey: string
  //   type: 's3'
  // }
}>({
  async onRequest({
    app,
    prefix,
    _: {
      serve,
    },
  }) {
    if (serve.type === 'r2') {
      if (!app.env) {
        throw new Error(
          'You need to use the Cloudflare Workers runtime to serve static files from an R2 bucket!',
        )
      }

      const bucket = app.env[serve.name] as R2Bucket

      const object = await bucket.get(
        prefix !== '*'
          ? app.request.pathname.substring(prefix.length + 1)
          : app.request.pathname,
      )

      if (object === null) {
        return
      }

      return new Response(object.body as ReadableStream, {
        headers: {
          ...(serve.etag !== false && { etag: object.httpEtag }),
          'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
        },
      })
    } else {
      const path = join(
        serve.directory,
        prefix !== '*'
          ? app.request.pathname.substring(prefix.length + 1)
          : app.request.pathname,
      )

      let exists,
        stat: Deno.FileInfo | undefined

      try {
        stat = await Deno.lstat(
          path,
        )

        exists = stat.isFile
      } catch (_) {
        exists = false
      }

      if (!exists || !stat) {
        return
      }

      const file = await Deno.open(
        path,
        { read: true },
      )

      return new Response(file.readable, {
        headers: {
          ...(serve.etag !== false &&
            {
              etag: Array.prototype.map.call(
                new Uint8Array(
                  await crypto.subtle.digest(
                    { name: 'SHA-1' },
                    new TextEncoder().encode(
                      `${stat.birthtime?.getTime()}:${stat.mtime?.getTime()}:${stat.size}`,
                    ),
                  ),
                ),
                (x) => ('00' + x.toString(16)).slice(-2),
              ).join(''),
            }),
          'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
        },
      })
    }
  },
})
