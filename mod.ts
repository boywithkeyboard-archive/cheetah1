// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
export { cheetah as default } from './cheetah.ts'
export type { AppConfig, AppContext } from './cheetah.ts'
export { Collection } from './collection.ts'
export { Context } from './context.ts'
export { Exception } from './exception.ts'
export { createExtension } from './extensions.ts'
export type { Extension } from './extensions.ts'

/* crypto ------------------------------------------------------------------- */

import { decode } from 'https://deno.land/std@0.198.0/encoding/base64.ts'

export async function encrypt(key: string, message: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12)),
    ivStr = Array.from(iv)
      .map((byte) => String.fromCharCode(byte))
      .join(''),
    alg = { name: 'AES-GCM', iv },
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      decode(key).buffer,
      alg,
      true,
      ['encrypt', 'decrypt'],
    ),
    cipherBuf = await crypto.subtle.encrypt(
      alg,
      cryptoKey,
      new TextEncoder().encode(message),
    ),
    cipherArr = Array.from(new Uint8Array(cipherBuf)),
    cipherStr = cipherArr.map((byte) => String.fromCharCode(byte))
      .join('')

  return btoa(ivStr + cipherStr)
}

export async function decrypt(key: string, message: string) {
  const iv = atob(message).slice(0, 12),
    alg = {
      name: 'AES-GCM',
      iv: new Uint8Array(
        Array.from(iv).map((char) => char.charCodeAt(0)),
      ),
    },
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      decode(key).buffer,
      alg,
      true,
      ['encrypt', 'decrypt'],
    ),
    cipherStr = atob(message).slice(12),
    cipherBuf = new Uint8Array(
      Array.from(cipherStr).map((char) => char.charCodeAt(0)),
    ),
    buf = await crypto.subtle.decrypt(alg, cryptoKey, cipherBuf)

  return new TextDecoder().decode(buf)
}
