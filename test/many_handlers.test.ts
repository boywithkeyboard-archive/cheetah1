import { assertEquals } from './deps.ts'
import cheetah from '../mod.ts'

Deno.test('Many Handlers', async (t) => {
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
