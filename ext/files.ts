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
    | {
      directory: string
      type?: 'fs'
    }
    | {
      name: string
      type: 'r2'
    }
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

      const data = await bucket.get(
        app.request.pathname.substring(prefix.length + 1),
      )

      if (data === null) {
        return
      }

      return new Response(data.body as ReadableStream)
      // } else if (source.type === 's3') {
      // TODO add support for s3
    } else {
      const path = join(
        serve.directory,
        app.request.pathname.substring(prefix.length + 1),
      )

      let exists

      try {
        const { isFile } = await Deno.lstat(
          path,
        )

        exists = isFile
      } catch (_) {
        exists = false
      }

      if (!exists) {
        return
      }

      const file = await Deno.open(
        path,
        { read: true },
      )

      return new Response(file.readable)
    }
  },
})
