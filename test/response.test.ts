import { assertEquals } from 'https://deno.land/std@v0.185.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('Response', async t => {
  const app = new cheetah()

  await t.step('res.code()', async () => {
    app.get('/code', c => c.res.code(101))
    assertEquals((await app.fetch(new Request('http://localhost:3000/code'))).status, 101)
  })

  await t.step('res.cookie()', async () => {
    app.get('/cookie', c => c.res.cookie('custom', 'test'))
    assertEquals((await app.fetch(new Request('http://localhost:3000/cookie'))).headers.get('set-cookie'), 'custom=test;')
  })

  await t.step('res.header()', async () => {
    app.get('/header', c => c.res.header('custom', 'test'))
    assertEquals((await app.fetch(new Request('http://localhost:3000/header'))).headers.get('custom'), 'test')
  })

  await t.step('res.redirect()', async () => {
    // temporary redirect
    app.get('/temporaryredirect', c => c.res.redirect('https://deno.com'))

    const response1 = await app.fetch(new Request('http://localhost:3000/temporaryredirect'))
    assertEquals(response1.status, 307)
    assertEquals(response1.headers.get('location'), 'https://deno.com')

    // permanent redirect
    app.get('/permanentredirect', c => c.res.redirect('https://deno.com', 301))

    const response2 = await app.fetch(new Request('http://localhost:3000/permanentredirect'))
    assertEquals(response2.status, 301)
    assertEquals(response2.headers.get('location'), 'https://deno.com')
  })

  await t.step('res.blob()', async () => {
    const blob = new Blob([ new TextEncoder().encode('test') ])

    app.get('/blob', c => c.res.blob(blob))

    assertEquals(new TextDecoder().decode(await (await (await app.fetch(new Request('http://localhost:3000/blob'))).blob()).arrayBuffer()), 'test')
  })

  await t.step('res.stream()', async () => {
    app.get('/stream', c => c.res.stream(new ReadableStream()))

    assertEquals((await app.fetch(new Request('http://localhost:3000/stream'))).body !== null, true)
  })

  await t.step('res.formData()', async () => {
    const formData = new FormData()
    formData.append('one', 'field')

    app.get('/formData', c => {
      c.res.formData(formData)
    })

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/formData'))).formData(), formData)
  })

  await t.step('res.buffer()', async () => {
    const buffer = new TextEncoder().encode('test')
    const arrayBuffer = buffer.buffer

    app.get('/buffer', c => {
      c.res.buffer(buffer)
    })

    assertEquals(await (await app.fetch(new Request('http://localhost:3000/buffer'))).arrayBuffer(), arrayBuffer)
  })

  await t.step('res.json()', async () => {
    app.get('/json', c => c.res.json({ message: 'test' }))
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/json'))).json(), { message: 'test' })
  })

  await t.step('res.text()', async () => {
    app.get('/text', c => c.res.text('test'))
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/text'))).text(), 'test')
  })

  await t.step('Implicit JSON', async () => {
    app.get('/implicit-json', () => ({ message: 'test' }))
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/implicit-json'))).json(), { message: 'test' })
  })

  await t.step('Implicit Text', async () => {
    app.get('/implicit-text', () => 'test')
    assertEquals(await (await app.fetch(new Request('http://localhost:3000/implicit-text'))).text(), 'test')
  })
})
