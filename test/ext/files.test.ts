// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { assertEquals } from 'std/assert/mod.ts'
import { files } from '../../ext/files.ts'
import cheetah from '../../mod.ts'

Deno.test('ext/files', async (t) => {
  await t.step('root', async () => {
    const app = new cheetah()

    app.use(files({
      serve: {
        directory: './test',
      },
    }))

    app.get('/', () => 'Hello World')

    const res1 = await app.fetch(new Request('http://localhost'))

    assertEquals(
      await res1.text(),
      'Hello World',
    )

    assertEquals(
      res1.status,
      200,
    )

    const res2 = await app.fetch(
      new Request('http://localhost/render.test.tsx'),
    )

    assertEquals(
      await res2.text(),
      await Deno.readTextFile('./test/render.test.tsx'),
    )

    assertEquals(
      res2.status,
      200,
    )
  })

  await t.step('with prefix', async () => {
    const app = new cheetah()

    app.use(
      '/t',
      files({
        serve: {
          directory: './test',
        },
      }),
    )

    app.get('/', () => 'Hello World')

    const res1 = await app.fetch(new Request('http://localhost'))

    assertEquals(
      await res1.text(),
      'Hello World',
    )

    assertEquals(
      res1.status,
      200,
    )

    const res2 = await app.fetch(
      new Request('http://localhost/t/ext/pretty.test.ts'),
    )

    assertEquals(
      await res2.text(),
      await Deno.readTextFile('./test/ext/pretty.test.ts'),
    )

    assertEquals(
      res2.status,
      200,
    )
  })
})
