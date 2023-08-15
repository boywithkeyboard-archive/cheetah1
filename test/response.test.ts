// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import cheetah from '../mod.ts'
import { assertEquals } from './deps.ts'

Deno.test('Response', async (t) => {
  const app = new cheetah()

  await t.step('res.code', async () => {
    app.get('/code', (c) => {
      c.res.code = 101
    })
    assertEquals(
      (await app.fetch(new Request('http://localhost/code'))).status,
      101,
    )
  })

  await t.step('res.bodySize', async () => {
    app.get('/body_size', (c) => {
      c.res.body = 'hello world'

      return c.res.bodySize.toString()
    })

    const result = await app.fetch(
      new Request('http://localhost/body_size'),
    )

    assertEquals(
      await result.text(),
      'hello world'.length.toString(),
    )
  })

  await t.step('res.setCookie()', async () => {
    app.get('/cookie', (c) => c.res.setCookie('custom', 'test'))
    assertEquals(
      (await app.fetch(new Request('http://localhost/cookie'))).headers
        .get('set-cookie'),
      'custom=test;',
    )
  })

  // TODO add test suite for res.deleteCookie()

  await t.step('res.header()', async () => {
    app.get('/header', (c) => c.res.header('custom', 'test'))
    assertEquals(
      (await app.fetch(new Request('http://localhost/header'))).headers
        .get('custom'),
      'test',
    )
  })

  await t.step('res.redirect()', async () => {
    // temporary redirect
    app.get('/temporaryredirect', (c) => c.res.redirect('https://deno.com'))

    const response1 = await app.fetch(
      new Request('http://localhost/temporaryredirect'),
    )
    assertEquals(response1.status, 307)
    assertEquals(response1.headers.get('location'), 'https://deno.com')

    // permanent redirect
    app.get(
      '/permanentredirect',
      (c) => c.res.redirect('https://deno.com', 301),
    )

    const response2 = await app.fetch(
      new Request('http://localhost/permanentredirect'),
    )
    assertEquals(response2.status, 301)
    assertEquals(response2.headers.get('location'), 'https://deno.com')
  })

  await t.step('blob', async () => {
    const blob = new Blob([new TextEncoder().encode('test')])

    app.get('/blob', () => {
      return blob
    })

    assertEquals(
      new TextDecoder().decode(
        await (await (await app.fetch(
          new Request('http://localhost/blob'),
        )).blob()).arrayBuffer(),
      ),
      'test',
    )
  })

  await t.step('stream', async () => {
    app.get('/stream', () => {
      return new ReadableStream()
    })

    assertEquals(
      (await app.fetch(new Request('http://localhost/stream'))).body !==
        null,
      true,
    )
  })

  await t.step('formData', async () => {
    const formData = new FormData()
    formData.append('one', 'field')

    app.get('/formData', () => {
      return formData
    })

    assertEquals(
      await (await app.fetch(new Request('http://localhost/formData')))
        .formData(),
      formData,
    )
  })

  await t.step('buffer', async () => {
    const buffer = new TextEncoder().encode('test')
    const arrayBuffer = buffer.buffer

    app.get('/buffer', () => {
      return buffer
    })

    assertEquals(
      await (await app.fetch(new Request('http://localhost/buffer')))
        .arrayBuffer(),
      arrayBuffer,
    )
  })

  await t.step('json', async () => {
    app.get('/json', () => {
      return {
        message: 'test',
      }
    })

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/json'),
      )).json(),
      { message: 'test' },
    )
  })

  await t.step('text', async () => {
    app.get('/text', () => {
      return 'test'
    })

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/text'),
      )).text(),
      'test',
    )
  })
})
