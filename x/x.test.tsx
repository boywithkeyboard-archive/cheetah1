// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { cheetah } from '../cheetah.ts'
import { assert, assertEquals, assertInstanceOf, defineConfig, presetAutoPrefix, presetTailwind, DOMParser } from '../test/deps.ts'
import { h, jsx } from './jsx.tsx'
import { createKey, importKey, sign, verify } from './jwt.ts'
import install from './tw.ts'

// TODO delete at v2.0

Deno.test('x', async (t) => {
  await t.step('jwt', async () => {
    const key = await createKey()
    const cryptoKey = await importKey(key)

    assertInstanceOf(cryptoKey, CryptoKey)

    const token = await sign({ example: 'object' }, key)

    assertEquals(await verify(token, key) !== undefined, true)
    assertEquals(await verify(token, cryptoKey) !== undefined, true)
  })

  await t.step('jsx', async (t) => {
    await t.step('plain', async () => {
      const app = new cheetah();

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

    await t.step('styled', async () => {
      const app = new cheetah();

      const twindConfig = defineConfig({
        presets: [presetAutoPrefix(), presetTailwind()],
      });

      install(twindConfig)

      function Styled() {
        return <h3 class="text-sm italic" id="styled">styled <code class="font-mono">h3</code> component</h3>
      }

      app.get('/a', (c) => jsx(c, Styled))
  
      const a = await app.fetch(new Request('http://localhost/a'))

      const document = new DOMParser().parseFromString(await a.text(), "text/html");

      assert(document)
      assert([...document.getElementsByTagName('style')].length)
      assertEquals(document.getElementById('styled')?.innerText, 'styled h3 component')
      assertEquals(
        a.headers.get('content-type'),
        'text/html; charset=utf-8',
      )
    })
  })
})
