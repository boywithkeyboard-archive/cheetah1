// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { gray, white } from 'https://deno.land/std@0.198.0/fmt/colors.ts'
import { Select } from 'https://deno.land/x/cliffy@v0.25.7/mod.ts'
import { createCryptoKey } from './create_crypto_key.ts'
import { createJwtSecret } from './create_jwt_secret.ts'

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
      gray(`🗝️ ${white(type.replace('_', ' '))} - ${await createJwtSecret()}`),
    )
  } else {
    console.info(
      gray(`🗝️ ${white(type.replace('_', ' '))} - ${await createCryptoKey()}`),
    )
  }
}
