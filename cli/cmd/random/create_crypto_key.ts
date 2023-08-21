// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { encode } from 'https://deno.land/std@0.198.0/encoding/base64.ts'

export async function createCryptoKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', hash: 'SHA-512', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )

  const exportedKey = await crypto.subtle.exportKey('raw', key)

  return encode(exportedKey)
}
