// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { encode } from 'std/encoding/base64.ts'

export async function createJwtSecret() {
  const key = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign', 'verify'],
  )

  const exportedKey = await crypto.subtle.exportKey('raw', key)

  return encode(exportedKey)
}
