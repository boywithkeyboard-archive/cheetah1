// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { R2Bucket } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230821.0/index.ts'
import { join } from 'https://deno.land/std@0.199.0/path/mod.ts'
import { createExtension } from '../extensions.ts'
import { AppContext } from '../mod.ts'

// An extension to serve static files from Cloudflare R2, an S3 bucket, or the local file system.

type FilesCommonType = {
  cacheControl?: string
  etag?: boolean
}

type FsType = {
  type?: 'fs'
  directory: string
}

type R2Type = {
  type: 'r2'
  name: string
}

type S3Type = {
  type: 's3'
  endpoint: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
}

/**
 * An extension to serve static files from Cloudflare R2 or the local file system.
 *
 * @since v1.2
 */
export const files = createExtension<{
  serve: FilesCommonType & (FsType | R2Type | S3Type)
}>({
  onRequest({
    app,
    prefix,
    _: {
      serve,
    },
  }) {
    switch (serve.type) {
      case 'r2':
        return handleR2Files(app, serve, prefix)
      case 's3':
        throw new Error('S3 is not yet supported!')
      case 'fs':
      default:
        return handleFsFiles(app, serve, prefix)
    }
  },
})

async function handleR2Files(
  app: AppContext,
  serve: FilesCommonType & R2Type,
  prefix: string,
) {
  if (app.runtime !== 'cloudflare' || !app.env) {
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

  if (!object) return new Response(null, { status: 404 })

  return new Response(object.body as ReadableStream, {
    headers: {
      ...(serve.etag !== false && { etag: object.httpEtag }),
      'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
    },
  })
}

async function handleFsFiles(
  app: AppContext,
  serve: FilesCommonType & FsType,
  prefix: string,
) {
  const path = join(
    serve.directory,
    prefix !== '*'
      ? app.request.pathname.substring(prefix.length + 1)
      : app.request.pathname,
  )

  let stat: Deno.FileInfo
  let file: Deno.FsFile

  try {
    stat = await Deno.lstat(path)
    if (stat.isDirectory) {
      stat = await Deno.lstat(join(path, 'index.html'))
      file = await Deno.open(join(path, 'index.html'), { read: true })
    } else {
      file = await Deno.open(path, { read: true })
    }
  } catch {
    try {
      stat = await Deno.lstat(join(serve.directory, '404.html'))
      file = await Deno.open(join(serve.directory, '404.html'), { read: true })
    } catch {
      return
    }
  }

  return new Response(file.readable, {
    headers: {
      ...(serve.etag !== false && { etag: await etag(stat) }),
      'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
    },
  })
}

async function etag(stat: Deno.FileInfo) {
  const encoder = new TextEncoder()
  const data = encoder.encode(
    `${stat.birthtime?.getTime()}:${stat.mtime?.getTime()}:${stat.size}`,
  )
  const hash = await crypto.subtle.digest({ name: 'SHA-1' }, data)
  const hashArray = Array.from(new Uint8Array(hash))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
