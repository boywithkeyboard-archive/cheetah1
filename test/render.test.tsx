// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */

import { h, render } from '../render.tsx'
import cheetah from '../mod.ts'
import {
  assert,
  assertEquals,
  defineConfig,
  DOMParser,
  install,
  presetAutoPrefix,
  presetTailwind,
} from './deps.ts'

Deno.test('render', async () => {
  const app = new cheetah()
  install(defineConfig({
    presets: [presetAutoPrefix(), presetTailwind()],
  }))

  function Styled() {
    return (
      <h3 class='text-sm italic' id='styled'>
        styled <code class='font-mono'>h3</code> component
      </h3>
    )
  }

  app.get('/a', (c) => render(c, Styled))

  const a = await app.fetch(new Request('http://localhost/a'))

  const document = new DOMParser().parseFromString(
    await a.text(),
    'text/html',
  )

  assert(document)
  assert([...document.getElementsByTagName('style')].length)
  assertEquals(
    document.getElementById('styled')?.innerText,
    'styled h3 component',
  )
  assertEquals(
    a.headers.get('content-type'),
    'text/html; charset=utf-8',
  )
})
