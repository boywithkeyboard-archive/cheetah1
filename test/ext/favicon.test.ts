// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { assertEquals } from 'std/assert/mod.ts'
import { favicon } from '../../src/extensions/favicon.ts'
import cheetah from '../../mod.ts'

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
