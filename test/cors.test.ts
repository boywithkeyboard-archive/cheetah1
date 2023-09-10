// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { assertEquals } from 'std/assert/mod.ts'
import cheetah from '../mod.ts'

Deno.test('CORS', async (t) => {
  const app = new cheetah({
    cors: '*',
  })

  await t.step('Global CORS', async () => {
    app.get('/global', () => 'test')

    const result = await app.fetch(
      new Request('http://localhost/global', {
        method: 'OPTIONS',
        headers: {
          origin: 'custom.com',
          'access-control-request-method': 'GET',
        },
      }),
    )

    assertEquals(result.headers.get('access-control-allow-origin'), '*')
  })

  await t.step('Per-Route CORS', async () => {
    app.get('/per-route', { cors: 'custom.com' }, () => 'test')

    const result = await app.fetch(
      new Request('http://localhost/per-route', {
        method: 'OPTIONS',
        headers: {
          origin: 'foobar.com',
          'access-control-request-method': 'GET',
        },
      }),
    )

    assertEquals(
      result.headers.get('access-control-allow-origin'),
      'custom.com',
    )
  })
})
