import { assertEquals } from 'https://deno.land/std@0.187.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('Request', async t => {
  const app = new cheetah()

  await t.step('req.param()', async () => {
    app.get('/users/:name', c => c.req.param('name'))
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/users/johndoe'))).text(), 'johndoe')
  })

  await t.step('req.ip', async () => {
    app.get('/ip', c => c.req.ip)

    const result = await (await app.fetch(new Request('http://localhost:3000/ip'))).text()
    assertEquals(typeof result === 'string' && result !== undefined, true)
  })

  await t.step('req.raw()', async () => {
    app.post('/raw', c => c.req.raw().method)

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/raw', { method: 'POST' }))).text(), 'POST')
  })

  await t.step('req.buffer()', async () => {
    app.post('/buffer', async c => await c.req.buffer() instanceof ArrayBuffer ? 'ok' : 'error')

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/buffer', { method: 'POST', body: 'test' }))).text(), 'ok')
  })

  await t.step('req.blob()', async () => {
    app.post('/blob', async c => await c.req.blob() instanceof Blob ? 'ok' : 'error')

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/blob', { method: 'POST', body: 'test' }))).text(), 'ok')
  })

  await t.step('req.formData()', async () => {
    app.post('/formData', async c => await c.req.formData() instanceof FormData ? 'ok' : 'error')
    app.post('/notFormData', async c => await c.req.formData() === null ? 'ok' : 'error')

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/formData', { method: 'POST', body: new FormData() }))).text(), 'ok')
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/notFormData', { method: 'POST', body: 'test' }))).text(), 'ok')
  })

  await t.step('req.stream()', async () => {
    app.post('/stream', async c => {
      const stream = c.req.stream()

      const text = stream !== null && stream instanceof ReadableStream ? 'ok' : 'error'

      if (stream !== null)
        await stream.cancel()

      return text
    })

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/stream', { method: 'POST', body: new ReadableStream() }))).text(), 'ok')
  })
})
