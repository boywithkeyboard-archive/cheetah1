// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import {
  assertEquals,
  assertInstanceOf,
} from 'https://deno.land/std@0.198.0/testing/asserts.ts'
import { cheetah } from '../cheetah.ts'
import { h, jsx } from './jsx.tsx'
import { createKey, importKey, sign, verify } from './jwt.ts'

Deno.test('x', async (t) => {
  await t.step('jwt', async () => {
    const key = await createKey()
    const cryptoKey = await importKey(key)

    assertInstanceOf(cryptoKey, CryptoKey)

    const token = await sign({ example: 'object' }, key)

    assertEquals(await verify(token, key) !== undefined, true)
    assertEquals(await verify(token, cryptoKey) !== undefined, true)
  })

  await t.step('jsx', async () => {
    const app = new cheetah()

    function Custom() {
      return <h1>hello world</h1>
    }

    app.get('/a', (c) => jsx(c, Custom))
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
})
