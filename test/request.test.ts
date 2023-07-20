// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import cheetah from '../mod.ts'
import { assertEquals, z } from './deps.ts'

Deno.test('Request', async (t) => {
  await t.step('req.param()', async () => {
    const app = new cheetah()

    app.get('/users/:name', (c) => c.req.param('name'))
    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/users/johndoe'),
      )).text(),
      'johndoe',
    )
  })

  await t.step('req.ip', async () => {
    const app = new cheetah()

    app.get('/ip', (c) => c.req.ip)

    const result =
      await (await app.fetch(new Request('http://localhost/ip'))).text()
    assertEquals(typeof result === 'string' && result !== undefined, true)
  })

  await t.step('req.raw()', async () => {
    const app = new cheetah()

    app.post('/raw', (c) => c.req.raw.method)

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/raw', { method: 'POST' }),
      )).text(),
      'POST',
    )
  })

  await t.step('req.body()', async (t) => {
    const app = new cheetah()

    const text = async (pathname: string, body: BodyInit) => {
      try {
        return await (await app.fetch(
          new Request(`http://localhost/${pathname}`, {
            method: 'POST',
            body,
          }),
        )).text()
      } catch (_err) {
        return null
      }
    }

    await t.step('req.body() - union (object, object)', async () => {
      app.post('/b', {
        body: z.union([
          z.object({
            bar: z.literal('foo'),
          }),
          z.object({
            foo: z.literal('bar'),
          }),
        ]),
      }, async (c) => {
        await c.req.body()

        return 'ok'
      })

      assertEquals(
        await text(
          'b',
          'test',
        ),
        'Bad Request',
      )

      assertEquals(
        await text(
          'b',
          JSON.stringify({
            foo: 'bar',
          }),
        ),
        'ok',
      )

      assertEquals(
        await text(
          'b',
          JSON.stringify({
            bar: 'foo',
          }),
        ),
        'ok',
      )

      assertEquals(
        await text(
          'b',
          JSON.stringify({
            abc: 'def',
          }),
        ),
        'Bad Request',
      )
    })

    await t.step('req.body() - union (string, string)', async () => {
      app.post('/c', {
        body: z.union([
          z.string().startsWith('http://'),
          z.string().startsWith('https://'),
        ]),
      }, async (c) => {
        await c.req.body()

        return 'ok'
      })

      assertEquals(
        await text('c', 'foo'),
        'Bad Request',
      )

      assertEquals(
        await text(
          'c',
          JSON.stringify({
            foo: 'bar',
          }),
        ),
        'Bad Request',
      )

      assertEquals(
        await text('c', 'https://foo.bar'),
        'ok',
      )

      assertEquals(
        await text('c', 'http://foo.bar'),
        'ok',
      )
    })

    await t.step('req.body() - string', async () => {
      app.post('/d', {
        body: z.string().max(3),
      }, async (c) => {
        await c.req.body()

        return 'ok'
      })

      assertEquals(
        await text('d', 'foo'),
        'ok',
      )

      assertEquals(
        await text('d', 'bar'),
        'ok',
      )

      assertEquals(
        await text(
          'd',
          'foo bar',
        ),
        'Bad Request',
      )
    })

    await t.step('req.body() - object', async () => {
      app.post('/e', {
        body: z.object({
          foo: z.literal('bar'),
        }),
      }, async (c) => {
        await c.req.body()

        return 'ok'
      })

      assertEquals(
        await text('e', 'test'),
        'Bad Request',
      )

      assertEquals(
        await text(
          'e',
          JSON.stringify({
            foo: 'bar',
          }),
        ),
        'ok',
      )

      assertEquals(
        await text(
          'e',
          JSON.stringify({
            abc: 'def',
          }),
        ),
        'Bad Request',
      )
    })

    await t.step('req.body() - record', async () => {
      app.post('/f', {
        body: z.record(z.string()),
      }, async (c) => {
        await c.req.body()

        return 'ok'
      })

      assertEquals(
        await text('f', 'test'),
        'Bad Request',
      )

      assertEquals(
        await text(
          'f',
          JSON.stringify({
            foo: 'bar',
          }),
        ),
        'ok',
      )

      assertEquals(
        await text(
          'f',
          JSON.stringify({
            abc: 'def',
          }),
        ),
        'ok',
      )
    })
  })

  await t.step('req.buffer()', async () => {
    const app = new cheetah()

    app.post(
      '/buffer',
      async (c) => await c.req.buffer() instanceof ArrayBuffer ? 'ok' : 'error',
    )

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/buffer', {
          method: 'POST',
          body: 'test',
        }),
      )).text(),
      'ok',
    )
  })

  await t.step('req.blob()', async () => {
    const app = new cheetah()

    app.post(
      '/blob',
      async (c) => await c.req.blob() instanceof Blob ? 'ok' : 'error',
    )

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/blob', {
          method: 'POST',
          body: 'test',
        }),
      )).text(),
      'ok',
    )
  })

  await t.step('req.formData()', async () => {
    const app = new cheetah()

    app.post(
      '/formData',
      async (c) => await c.req.formData() instanceof FormData ? 'ok' : 'error',
    )
    app.post(
      '/notFormData',
      async (c) => await c.req.formData() === null ? 'ok' : 'error',
    )

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/formData', {
          method: 'POST',
          body: new FormData(),
        }),
      )).text(),
      'ok',
    )
    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/notFormData', {
          method: 'POST',
          body: 'test',
        }),
      )).text(),
      'ok',
    )
  })

  await t.step('req.stream()', async () => {
    const app = new cheetah()

    app.post('/stream', async (c) => {
      const stream = c.req.stream

      const text = stream !== null && stream instanceof ReadableStream
        ? 'ok'
        : 'error'

      if (stream !== null) {
        await stream.cancel()
      }

      return text
    })

    assertEquals(
      await (await app.fetch(
        new Request('http://localhost/stream', {
          method: 'POST',
          body: new ReadableStream(),
        }),
      )).text(),
      'ok',
    )
  })
})
