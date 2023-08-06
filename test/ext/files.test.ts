// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { files } from '../../ext/files.ts'
import cheetah from '../../mod.ts'
import { assertEquals } from '../deps.ts'

Deno.test('ext/favicon', async (t) => {
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

    const res2 = await app.fetch(new Request('http://localhost/deps.ts'))

    assertEquals(
      await res2.text(),
      await Deno.readTextFile('./test/deps.ts'),
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
