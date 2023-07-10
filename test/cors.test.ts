import { assertEquals } from './deps.ts'
import cheetah from '../mod.ts'

Deno.test('CORS', async (t) => {
  const app = new cheetah({
    cors: '*',
  })

  await t.step('Global CORS', async () => {
    app.get('/global', () => 'test')

    const result = await app.fetch(
      new Request('http://localhost:3000/global', {
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
      new Request('http://localhost:3000/per-route', {
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
