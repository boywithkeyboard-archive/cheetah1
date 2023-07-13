// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { assertEquals } from 'https://deno.land/std@0.194.0/testing/asserts.ts'
import { cheetah } from '../cheetah.ts'
import { h, jsx } from './jsx.tsx'

Deno.test('x/jsx', async () => {
  const app = new cheetah()

  function Custom() {
    return <h1>hello world</h1>
  }

  app.get('/a/:param', (c) => jsx(c, Custom))
  app.get('/b', (c) => jsx(c, <Custom />))

  const a = await app.fetch(new Request('http://localhost/a'))
  const b = await app.fetch(new Request('http://localhost/b'))

  assertEquals(
    await a.text(),
    '<h1>hello world</h1>',
  )
  assertEquals(
    a.headers.get('content-type'),
    'text/html; charset=utf-8',
  )
  assertEquals(
    await b.text(),
    '<h1>hello world</h1>',
  )
  assertEquals(
    b.headers.get('content-type'),
    'text/html; charset=utf-8',
  )
})
