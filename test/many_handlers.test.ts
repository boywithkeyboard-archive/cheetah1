// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { assertEquals } from 'https://deno.land/std@0.194.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('Many Handlers', async () => {
  const app = new cheetah()

  app.get('/test', (_, next) => {
    next()

    return 'a'
  }, (c) => {
    if (c.req.headers.foo !== undefined) {
      return 'b'
    }
  })

  assertEquals(
    await (await app.fetch(new Request('http://localhost/test'))).text(),
    'a',
  )

  assertEquals(
    await (await app.fetch(
      new Request('http://localhost/test', { headers: { 'foo': 'bar' } }),
    )).text(),
    'b',
  )
})
