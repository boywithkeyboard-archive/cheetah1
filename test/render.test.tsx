// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import cheetah, { h, Renderer } from '../mod.ts'
import { assert, assertEquals, DOMParser } from './deps.ts'

Deno.test('render', async () => {
  const app = new cheetah()

  const { render } = new Renderer()

  function Styled() {
    return (
      <h3 class='text-sm italic' id='styled'>
        styled <code class='font-mono'>h3</code> component
      </h3>
    )
  }

  app.get('/a', (c) => render(c, <Styled />))

  const a = await app.fetch(new Request('http://localhost/a'))

  const tx = await a.text()

  const document = new DOMParser().parseFromString(
    tx,
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

Deno.test('No empty style tag is injected if no twind styles are utilised.', async () => {
  const app = new cheetah()

  const { render } = new Renderer()

  function NonStyled() {
    return (
      <h3 id='styled'>
        non-styled <code>h3</code> component
      </h3>
    )
  }

  app.get('/a', (c) => render(c, <NonStyled />))

  const a = await app.fetch(new Request('http://localhost/a'))

  const tx = await a.text()

  const document = new DOMParser().parseFromString(
    tx,
    'text/html',
  )
  assert(document)
  assertEquals(
    [...document.getElementsByTagName('style')].length,
    0,
  )
})
