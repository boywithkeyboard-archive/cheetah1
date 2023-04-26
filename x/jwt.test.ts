import { assertEquals, assertInstanceOf } from 'https://deno.land/std@v0.184.0/testing/asserts.ts'
import { createKey, importKey, jwt } from './mod.ts'

Deno.test('x/jwt', async t => {
  const key = await createKey()
  const cryptoKey = await importKey(key)

  assertInstanceOf(cryptoKey, CryptoKey)

  await t.step('sign/verify', async () => {
    const token = await jwt.sign({ example: 'object' }, key)

    assertEquals(await jwt.verify(token, key) !== undefined, true)
    assertEquals(await jwt.verify(token, cryptoKey) !== undefined, true)
  })
})
