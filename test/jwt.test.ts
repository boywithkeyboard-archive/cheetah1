// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { cheetah } from '../cheetah.ts'
import { createJwtSecret } from '../cli/cmd/random/create_jwt_secret.ts'
import { jwt } from '../mod.ts'
import { assertEquals } from '../test/deps.ts'

Deno.test('jwt', async () => {
  const key = await createJwtSecret()

  const token = await jwt.sign(key, { example: 'object' })

  assertEquals(
    await jwt.verify(await createJwtSecret(), token) === undefined,
    true,
  )
  assertEquals(await jwt.verify(key, token) !== undefined, true)

  Deno.env.set('jwt_secret', key)

  const app = new cheetah()

  app.get('/one', async (c) => {
    assertEquals(await jwt.verify(c, token) !== undefined, true)
  })

  await app.fetch(new Request('http://localhost/one'))

  Deno.env.delete('jwt_secret')
  Deno.env.set('JWT_SECRET', key)

  app.get('/two', async (c) => {
    assertEquals(await jwt.verify(c, token) !== undefined, true)
  })

  await app.fetch(new Request('http://localhost/two'))
})
