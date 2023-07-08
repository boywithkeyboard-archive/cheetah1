import { assertEquals } from 'https://deno.land/std@0.193.0/testing/asserts.ts'
import cheetah from '../mod.ts'
import typebox, { Type } from '../validator/typebox.ts'
import zod, { z } from '../validator/zod.ts'

Deno.test('Validation', async (t) => {
  await t.step('transform', async () => {
    const app = new cheetah({
      validator: zod,
    })

    app.post('/one', {
      body: z.object({
        message: z.string(),
      }),
      transform: true,
    }, (c) => {
      assertEquals(c.req.body, { message: 'Hello World' })

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

  await t.step('TypeBox', async (t) => {
    const app = new cheetah({
      validator: typebox,
    })

    await t.step('body', async () => {
      // string
      app.post('/string-body', {
        body: Type.String({ minLength: 1, maxLength: 16 }),
      }, () => 'this is fine')

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
      assertEquals(await res3.text(), 'this is fine')

      // json
      app.post('/json-body', {
        body: Type.Object({ a: Type.String(), b: Type.Number() }),
      }, () => 'this is a valid object')

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
      assertEquals(await res6.text(), 'this is a valid object')
    })

    await t.step('cookies', async () => {
      app.get('/cookies', {
        cookies: Type.Object({
          custom: Type.String({ minLength: 4, maxLength: 16 }),
        }),
      }, () => {})

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
      app.get('/headers', {
        headers: Type.Object({
          custom: Type.RegEx(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          ),
        }),
      }, () => 'this are valid headers')

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
      assertEquals(await res4.text(), 'this are valid headers')
    })

    await t.step('query', async () => {
      app.get('/query', {
        query: Type.Object({
          first: Type.Optional(Type.String()),
          second: Type.Boolean(),
          third: Type.Number(),
        }),
      }, () => {})

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

  await t.step('Zod', async (t) => {
    const app = new cheetah({
      validator: zod,
    })

    await t.step('body', async () => {
      // string
      app.post(
        '/string-body',
        { body: z.string().min(1).max(16) },
        () => 'this is fine',
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
      assertEquals(await res3.text(), 'this is fine')

      // json
      app.post('/json-body', {
        body: z.object({ a: z.string(), b: z.number() }),
      }, () => 'this is a valid object')

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
      assertEquals(await res6.text(), 'this is a valid object')
    })

    await t.step('cookies', async () => {
      app.get('/cookies', {
        cookies: z.object({ custom: z.string().min(4).max(16) }).strict(),
      }, () => {})

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
        () => 'this are valid headers',
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
      assertEquals(await res4.text(), 'this are valid headers')
    })

    await t.step('query', async () => {
      app.get('/query', {
        query: z.object({
          first: z.string().optional(),
          second: z.boolean(),
          third: z.number(),
        }),
      }, () => {})

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
})
