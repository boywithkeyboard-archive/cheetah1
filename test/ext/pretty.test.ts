// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { pretty } from '../../ext/pretty.ts'
import cheetah from '../../mod.ts'
import { assertEquals } from '../deps.ts'

Deno.test('ext/pretty', async (t) => {
  const obj = {
    lastname: 'Doe',
    firstname: 'John',
    data: {
      height: 180,
      age: 20,
    },
  }

  await t.step('indent', async () => {
    const app = new cheetah()
      .use(pretty({
        indentSize: 4,
        sort: false,
      }))

    app.get('/', () => obj)

    const result = await app.fetch(new Request('http://localhost'))

    assertEquals(
      await result.text(),
      JSON.stringify(
        {
          lastname: 'Doe',
          firstname: 'John',
          data: {
            height: 180,
            age: 20,
          },
        },
        null,
        4,
      ),
    )

    assertEquals(
      result.headers.get('content-type'),
      'application/json; charset=utf-8',
    )
  })

  await t.step('sort', async () => {
    const app = new cheetah()
      .use(pretty())

    app.get('/', () => obj)

    const result = await app.fetch(new Request('http://localhost'))

    assertEquals(
      await result.text(),
      JSON.stringify(
        {
          data: {
            age: 20,
            height: 180,
          },
          firstname: 'John',
          lastname: 'Doe',
        },
        null,
        2,
      ),
    )

    assertEquals(
      result.headers.get('content-type'),
      'application/json; charset=utf-8',
    )
  })
})
