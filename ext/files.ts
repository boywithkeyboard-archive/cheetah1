// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { R2Bucket } from 'https://cdn.jsdelivr.net/npm/@cloudflare/workers-types@4.20230821.0/index.ts'
import { join } from 'https://deno.land/std@0.200.0/path/mod.ts'
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'
import { createExtension } from '../extensions.ts'
import { AppContext } from '../mod.ts'

// An extension to serve static files from Cloudflare R2, an S3 bucket, or the local file system.

type GeneralOptions = {
  cacheControl?: string
  etag?: boolean
}

type FsOptions = {
  type?: 'fs'
  directory: string
}

type R2Options = {
  type: 'r2'
  name: string
}

type S3Options = {
  type: 's3'
  endpoint?: string
  accessKeyId?: string
  secretAccessKey?: string
}

const awsClient = new AwsClient({
  accessKeyId: '',
  secretAccessKey: '',
})

/**
 * An extension to serve static files from Cloudflare R2 or the local file system.
 *
 * @since v1.2
 */
export const files = createExtension<{
  serve: GeneralOptions & (FsOptions | R2Options | S3Options)
}>({
  // onPlugIn({ settings }) {
  //     if (settings.serve.type === 's3') {
  //     awsClient = new AwsClient({
  //       accessKeyId: settings.serve.accessKeyId,
  //       secretAccessKey: settings.serve.secretAccessKey,
  //     })
  //   }
  // },
  onRequest({
    app,
    prefix,
    _: {
      serve,
    },
    req: request,
  }) {
    switch (serve.type) {
      case 'r2':
        return handleR2Files(app, serve, prefix)
      case 's3': {
        const keyId = Deno.env.get('AWS_ACCESS_KEY_ID') ?? serve.accessKeyId
        if (!keyId) throw new Error('AWS_ACCESS_KEY_ID is not set')
        const accessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY') ??
          serve.secretAccessKey
        if (!accessKey) throw new Error('AWS_SECRET_ACCESS_KEY is not set')
        awsClient.accessKeyId = keyId
        awsClient.secretAccessKey = accessKey
        return handleS3Files(app, serve, prefix, request)
      }
      case 'fs':
      default:
        return handleFsFiles(app, serve, prefix)
    }
  },
})

async function handleS3Files(
  app: AppContext,
  serve: GeneralOptions & S3Options,
  prefix: string,
  request: Request,
) {
  const path = join(
    prefix !== '*'
      ? app.request.pathname.substring(prefix.length + 1)
      : app.request.pathname,
  )

  let response = await awsClient.fetch(
    `${serve.endpoint}${path}`,
    {
      headers: {
        ...(serve.etag !== false &&
          { etag: request.headers.get('if-none-match') ?? '' }),
        'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
      },
    },
  )

  if (response.status === 404) {
    const indexPath = join(path, 'index.html')
    response = await awsClient.fetch(
      `${serve.endpoint}${indexPath}`,
      {
        headers: {
          ...(serve.etag !== false &&
            { etag: request.headers.get('if-none-match') ?? '' }),
          'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
        },
      },
    )
    if (response.status === 404) {
      const indexPath = join(path, '404.html')
      response = await awsClient.fetch(
        `${serve.endpoint}${indexPath}`,
        {
          headers: {
            'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
          },
        },
      )
    }
  }

  return response.status === 404 ? undefined : response
}

async function handleR2Files(
  app: AppContext,
  serve: GeneralOptions & R2Options,
  prefix: string,
) {
  if (app.runtime !== 'cloudflare' || !app.env) {
    throw new Error(
      'You need to use the Cloudflare Workers runtime to serve static files from an R2 bucket!',
    )
  }

  const bucket = app.env[serve.name] as R2Bucket
  const path = prefix !== '*'
    ? app.request.pathname.substring(prefix.length + 1)
    : app.request.pathname

  let object = await bucket.get(path)
  if (object) {
    return new Response(object.body as ReadableStream, {
      headers: {
        ...(serve.etag !== false && { etag: object.httpEtag }),
        'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
      },
    })
  }

  const indexPath = join(app.request.pathname, 'index.html')
  object = await bucket.get(indexPath)
  if (object) {
    return new Response(object.body as ReadableStream, {
      headers: {
        ...(serve.etag !== false && { etag: object.httpEtag }),
        'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
      },
    })
  }

  const errorPath = join(prefix, '404.html')
  object = await bucket.get(errorPath)
  if (object) {
    return new Response(object.body as ReadableStream, {
      headers: {
        'cache-control': serve.cacheControl ?? 's-maxage=300', // 5m
      },
    })
  }
}

async function handleFsFiles(
  app: AppContext,
  serve: GeneralOptions & FsOptions,
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
