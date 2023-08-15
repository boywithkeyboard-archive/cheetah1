// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { encode } from 'https://deno.land/std@0.198.0/encoding/base64.ts'
import { gray, white } from 'https://deno.land/std@0.198.0/fmt/colors.ts'
import { Select } from 'https://deno.land/x/cliffy@v0.25.7/mod.ts'
import * as jwt from '../../x/jwt.ts'

export async function randomCommand() {
  const type: string = await Select.prompt({
    message: 'What do you want to create?',
    options: [
      { name: 'JWT Secret', value: 'jwt_secret' },
      { name: 'Crypto Key', value: 'crypto_key' },
    ],
  })

  if (type === 'jwt_secret') {
    console.info(
      gray(`🗝️ ${white(type.replace('_', ' '))} - ${await jwt.createKey()}`),
    )
  } else {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', hash: 'SHA-512', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    const exportedKey = await crypto.subtle.exportKey('raw', key)

    console.info(
      gray(`🗝️ ${white(type.replace('_', ' '))} - ${encode(exportedKey)}`),
    )
  }
}
