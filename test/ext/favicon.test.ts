// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { favicon } from '../../ext/favicon.ts'
import cheetah from '../../mod.ts'
import { assertEquals } from '../deps.ts'

Deno.test('ext/favicon', async () => {
  const app = new cheetah()

  app.use(favicon({
    source: await Deno.readFile('./.github/cheetah.svg'),
  }))

  app.get('/', () => 'Hello World')

  const res = await app.fetch(new Request('http://localhost/favicon.ico'))

  assertEquals(
    await res.text(),
    await Deno.readTextFile('./.github/cheetah.svg'),
  )

  assertEquals(
    res.status,
    200,
  )
})
