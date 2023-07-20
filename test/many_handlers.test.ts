// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import cheetah from '../mod.ts'
import { assertEquals } from './deps.ts'

Deno.test('Many Handlers', async () => {
  const app = new cheetah()

  app.get('/a', (_, next) => {
    next()

    return 'a'
  }, (c) => {
    if (c.req.headers.foo !== undefined) {
      return 'b'
    }
  })

  app.get('/b', (c) => {
    c.res.header('foo', 'bar')
  }, (c) => {
    c.res.header('foo', 'foo')
  })

  app.get('/c', (c, next) => {
    c.res.header('foo', 'bar')

    next()
  }, (c) => {
    c.res.header('foo', 'foo')
  })

  assertEquals(
    await (await app.fetch(new Request('http://localhost/a'))).text(),
    'a',
  )

  assertEquals(
    await (await app.fetch(
      new Request('http://localhost/a', { headers: { 'foo': 'bar' } }),
    )).text(),
    'b',
  )

  assertEquals(
    (await app.fetch(new Request('http://localhost/b'))).headers.get('foo'),
    'bar',
  )

  assertEquals(
    (await app.fetch(new Request('http://localhost/c'))).headers.get('foo'),
    'foo',
  )
})
