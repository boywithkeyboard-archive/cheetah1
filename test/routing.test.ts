// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import cheetah, { Collection } from '../mod.ts'
import { assertEquals } from './deps.ts'

Deno.test('Nesting/Routing', async (t) => {
  const collection = new Collection()
    .get('/', () => 'nested root route')
    .get('/nestedroute', () => 'nested route')

  await t.step('Root with Base Path', async () => {
    const r1 = new cheetah({
      base: '/api',
    })
      .use('/collection', collection)

    assertEquals(
      await (await r1.fetch(
        new Request('http://localhost/api/collection'),
      )).text(),
      'nested root route',
    )
    assertEquals(
      await (await r1.fetch(
        new Request('http://localhost/api/collection/nestedroute'),
      )).text(),
      'nested route',
    )
  })

  await t.step('Root without Base Path', async () => {
    const r2 = new cheetah()
      .use('/collection', collection)

    assertEquals(
      await (await r2.fetch(new Request('http://localhost/collection')))
        .text(),
      'nested root route',
    )
    assertEquals(
      await (await r2.fetch(
        new Request('http://localhost/collection/nestedroute'),
      )).text(),
      'nested route',
    )
  })
})
