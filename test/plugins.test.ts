import { assertEquals, assertInstanceOf } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import cheetah, { createPlugin } from '../mod.ts'

Deno.test('Plugins', async t => {
  await t.step('beforeParsing (global)', async () => {
    const app = new cheetah()

    const plugin = createPlugin({
      beforeParsing(request) {
        assertInstanceOf(request, Request)
      }
    })

    app.use(plugin)

    app.get('/test', () => 'Hello World')

    const result = await (await app.fetch(new Request('http://localhost:3000/test'))).text()
    assertEquals(result, 'Hello World')
  })

  await t.step('beforeParsing (prefix)', async () => {
    const app = new cheetah()

    const plugin = createPlugin({
      beforeParsing(request) {
        const url = new URL(request.url)

        assertEquals(url.pathname, '/prefix/test')
      }
    })

    app.use('/prefix', plugin)

    app.get('/test', () => 'Hello World')

    app.get('/prefix/test', () => 'Hello World')

    app.get('/prefixinvalid/test', () => 'Hello World')

    const result1 = await (await app.fetch(new Request('http://localhost:3000/test'))).text()
    assertEquals(result1, 'Hello World')

    const result2 = await (await app.fetch(new Request('http://localhost:3000/prefix/test'))).text()
    assertEquals(result2, 'Hello World')

    const result3 = await (await app.fetch(new Request('http://localhost:3000/prefixinvalid/test'))).text()
    assertEquals(result3, 'Hello World')
  })

  await t.step('afterParsing (global)', async () => {
    const app = new cheetah()

    const plugin = createPlugin({
      beforeHandling(c) {
        c.req.headers.custom = 'test'
      }
    })

    app.use(plugin)

    app.get('/test', c => {
      assertEquals((c.req.headers as Record<string, string>).custom, 'test')

      return 'Hello World'
    })

    app.get('/another_test', c => {
      assertEquals((c.req.headers as Record<string, string>).custom, 'test')

      return 'Hello World'
    })

    const result1 = await (await app.fetch(new Request('http://localhost:3000/test'))).text()
    assertEquals(result1, 'Hello World')

    const result2 = await (await app.fetch(new Request('http://localhost:3000/another_test'))).text()
    assertEquals(result2, 'Hello World')
  })
})
