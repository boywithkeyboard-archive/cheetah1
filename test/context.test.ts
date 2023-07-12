// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { assertEquals } from 'https://deno.land/std@0.193.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('Context', async (t) => {
  Deno.env.set('cheetah_test', 'test')

  const app = new cheetah()

  await t.step('c.runtime', async () => {
    app.get('/runtime', (c) => c.runtime)
    assertEquals(
      await (await app.fetch(new Request('http://localhost:3000/runtime')))
        .text(),
      'deno',
    )
  })
})
