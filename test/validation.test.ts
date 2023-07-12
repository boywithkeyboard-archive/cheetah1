// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import cheetah from '../mod.ts'
import { assertEquals } from 'https://deno.land/std@0.193.0/testing/asserts.ts'
import z from 'https://deno.land/x/zod@v3.21.4/index.ts'

Deno.test('Validation', async (t) => {
  await t.step('transform', async () => {
    const app = new cheetah()

    app.post('/one', {
      body: z.object({
        message: z.string(),
      }),
      transform: true,
    }, async (c) => {
      assertEquals(await c.req.body(), { message: 'Hello World' })

      return 'test'
    })

    const form = new FormData()
    form.append('message', 'Hello World')
    await (await app.fetch(
      new Request('http://localhost:3000/one', { method: 'POST', body: form }),
    )).text()

    await (await app.fetch(
      new Request('http://localhost:3000/one', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello World' }),
      }),
    )).text()
  })

  const app = new cheetah()

  await t.step('body', async () => {
    // string
    app.post(
      '/string-body',
      { body: z.string().min(1).max(16) },
      async (c) => {
        return await c.req.body()
      },
    )

    const res1 = await app.fetch(
      new Request('http://localhost:3000/string-body', {
        method: 'POST',
        body:
          'a really long string that is surely not between 1 and 12 characters long',
      }),
    )
    const res2 = await app.fetch(
      new Request('http://localhost:3000/string-body', {
        method: 'POST',
        body: '',
      }),
    )
    const res3 = await app.fetch(
      new Request('http://localhost:3000/string-body', {
        method: 'POST',
        body: 'should be fine',
      }),
    )

    assertEquals(res1.status, 400)
    assertEquals(res2.status, 400)
    assertEquals(res3.status, 200)
    assertEquals(await res3.text(), 'should be fine')

    // json
    app.post('/json-body', {
      body: z.object({ a: z.string(), b: z.number() }),
    }, async (c) => {
      return await c.req.body()
    })

    const res4 = await app.fetch(
      new Request('http://localhost:3000/json-body', {
        method: 'POST',
        body: 'a random string',
      }),
    )
    const res5 = await app.fetch(
      new Request('http://localhost:3000/json-body', {
        method: 'POST',
        body: JSON.stringify({ a: 'test', b: false }),
      }),
    )
    const res6 = await app.fetch(
      new Request('http://localhost:3000/json-body', {
        method: 'POST',
        body: JSON.stringify({ a: 'test', b: 1 }),
      }),
    )
    const res7 = await app.fetch(
      new Request('http://localhost:3000/json-body', {
        method: 'POST',
        body: JSON.stringify({ a: 'test' }),
      }),
    )

    assertEquals(res4.status, 400)
    assertEquals(res5.status, 400)
    assertEquals(res6.status, 200)
    assertEquals(res7.status, 400)
    assertEquals(await res6.json(), { a: 'test', b: 1 })
  })

  await t.step('cookies', async () => {
    app.get('/cookies', {
      cookies: z.object({ custom: z.string().min(4).max(16) }).strict(),
    }, (c) => {
      return c.req.cookies
    })

    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/cookies', {
          headers: { cookies: 'custom=test;' },
        }),
      )).status,
      200,
    )
    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/cookies', {
          headers: { cookie: 'custom=te;' },
        }),
      )).status,
      400,
    )
    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/cookies', {
          headers: { cookie: 'invalid=abc;' },
        }),
      )).status,
      400,
    )
    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/cookies', {
          headers: { cookie: 'custom=test; another=cookie;' },
        }),
      )).status,
      400,
    )
  })

  await t.step('headers', async () => {
    app.get(
      '/headers',
      { headers: z.object({ custom: z.string().email() }) },
      (c) => {
        return c.req.headers
      },
    )

    const res1 = await app.fetch(
      new Request('http://localhost:3000/headers', {
        headers: { random: 'bullshit' },
      }),
    )
    const res2 = await app.fetch(
      new Request('http://localhost:3000/headers', {
        headers: { random: 'bullshit', custom: 'tes@t' },
      }),
    )
    const res3 = await app.fetch(
      new Request('http://localhost:3000/headers', {
        headers: { custom: '' },
      }),
    )
    const res4 = await app.fetch(
      new Request('http://localhost:3000/headers', {
        headers: { custom: 'test@email.com' },
      }),
    )

    assertEquals(res1.status, 400)
    assertEquals(res2.status, 400)
    assertEquals(res3.status, 400)
    assertEquals(res4.status, 200)
    assertEquals(await res4.json(), { custom: 'test@email.com' })
  })

  await t.step('query', async () => {
    app.get('/query', {
      query: z.object({
        first: z.string().optional(),
        second: z.boolean(),
        third: z.number(),
      }),
    }, (c) => {
      return c.req.query
    })

    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/query?first=test&second&third=69'),
      )).status,
      200,
    )
    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/query?second=false&third=e9'),
      )).status,
      400,
    )
    assertEquals(
      (await app.fetch(
        new Request('http://localhost:3000/query?second=false&third=69'),
      )).status,
      200,
    )
  })
})
