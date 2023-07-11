import cheetah, { createExtension } from '../mod.ts'
import { assertEquals } from './deps.ts'

Deno.test('Extensions', async (t) => {
  const a = createExtension({
    onRequest(req) {
      req.headers.set('custom', 'test')
    },
  })

  const b = createExtension({
    onResponse(c) {
      c.res.body = 'custom'
    },
  })

  const c = createExtension({
    onRequest(req) {
      const url = new URL(req.url)

      if (url.pathname.startsWith('/foo')) {
        return new Response('hello')
      }
    },
  })

  const app = new cheetah()
    .use(a(), c())
    .use('/b', b())
    .get('/a', (c) => {
      assertEquals(c.req.headers.custom, 'test')

      return 'test'
    })
    .get('/b', (c) => {
      assertEquals(c.req.headers.custom, 'test')

      return 'test'
    })

  await t.step('onRequest', async () => {
    const result = await app.fetch(new Request('http://localhost/a'))

    assertEquals(await result.text(), 'test')
  })

  await t.step('onResponse', async () => {
    const result1 = await app.fetch(new Request('http://localhost/b'))

    assertEquals(await result1.text(), 'custom')

    const result2 = await app.fetch(new Request('http://localhost/foo/bar'))

    assertEquals(await result2.text(), 'hello')
  })
})
