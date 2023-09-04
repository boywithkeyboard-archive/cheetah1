// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { Fragment, VNode } from 'https://esm.sh/preact@10.17.1'
import cheetah, { h, Renderer } from '../mod.ts'
import { assert, assertEquals, DOMParser, z } from './deps.ts'

const Document = ({ children }: { children: VNode }) => {
  return (
    <html>
      <head>
        <title>This is a document!</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

const Styled = () => {
  return (
    <Document>
      <h3 class='text-sm italic' id='styled'>
        styled <code class='font-mono'>h3</code> component
      </h3>
    </Document>
  )
}

const Unstyled = () => {
  return (
    <Document>
      <h3 id='unstyled'>
        unstyled <code>h3</code> component
      </h3>
    </Document>
  )
}

const MetaTagsWithoutWrappers = () => {
  return (
    <>
      <title>This is a document!</title>
      <meta charSet='utf-8' />
      <h1>Hello world!</h1>
    </>
  )
}

const app = new cheetah()

const { render } = new Renderer()

app.get('/render', {
  query: z.object({
    type: z.union([
      z.literal('styled'),
      z.literal('unstyled'),
      z.literal('meta-tags-without-wrappers'),
    ]),
  }),
}, (ctx) => {
  const type = ctx.req.query.type
  if (type === 'meta-tags-without-wrappers') {
    return render(ctx, <MetaTagsWithoutWrappers />)
  }
  render(
    ctx,
    type === 'styled' ? <Styled /> : <Unstyled />,
  )
})

Deno.test('render', async (test) => {
  await test.step('Twind styles are applied to the resulting HTML correctly.', async () => {
    const renderResponse = await app.fetch(
      new Request('http://localhost/render?type=styled'),
    )
    const htmlText = await renderResponse.text()
    const document = new DOMParser().parseFromString(
      htmlText,
      'text/html',
    )
    assert(document)
    assert([...document.getElementsByTagName('style')].length === 1)
    assertEquals(
      document.getElementById('styled')?.innerText,
      'styled h3 component',
    )
    assertEquals(
      renderResponse.headers.get('content-type'),
      'text/html; charset=utf-8',
    )
  })

  const renderResponse = await app.fetch(
    new Request('http://localhost/render?type=unstyled'),
  )
  const htmlText = await renderResponse.text()
  const document = new DOMParser().parseFromString(
    htmlText,
    'text/html',
  )

  assert(document)
  await test.step('No empty style tag is injected if no Twind styles are utilised.', () => {
    assertEquals(
      [...document.getElementsByTagName('style')].length,
      0,
    )
    assertEquals(
      document.getElementById('unstyled')?.innerText,
      'unstyled h3 component',
    )
    assertEquals(
      renderResponse.headers.get('content-type'),
      'text/html; charset=utf-8',
    )
  })

  await test.step('Head meta tags are able to be injected into the HTML output properly.', () => {
    const headElementsInDocument = [...document.getElementsByTagName('head')]
    assert(headElementsInDocument.length === 1)
    const headElementInDocument = headElementsInDocument.at(0)
    assert(headElementInDocument)
    assert(
      [...headElementInDocument.children].find((childNode) =>
        childNode.tagName === 'TITLE' &&
        childNode.textContent === 'This is a document!'
      ),
    )
  })

  await test.step('Even without the essential html, head and body tags in the JSX input, the JSX input is injected correctly into the appropriate places.', async () => {
    const renderResponse = await app.fetch(
      new Request('http://localhost/render?type=meta-tags-without-wrappers'),
    )
    const htmlText = await renderResponse.text()
    const document = new DOMParser().parseFromString(
      htmlText,
      'text/html',
    )
    assert(document)
    const { documentElement } = document
    assert(documentElement)
    const headElementsInDocument = documentElement.getElementsByTagName('head')
    const [headElement] = headElementsInDocument
    assert(headElement)
    const titleElementInDocument = headElement.getElementsByTagName('title').at(
      0,
    )
    assert(
      titleElementInDocument &&
        titleElementInDocument.textContent === 'This is a document!',
    )
    const metaTagsInDocument = documentElement.getElementsByTagName('meta')
    assert(
      metaTagsInDocument.find((metaTag) =>
        metaTag.getAttribute('charset') === 'utf-8'
      ),
    )
    const [bodyElement] = documentElement.getElementsByTagName('body')
    assert(bodyElement)
    const [headingElementInBody] = [...bodyElement.children]
    assert(
      headingElementInBody !== undefined &&
        headingElementInBody.tagName === 'H1' &&
        headingElementInBody.textContent === 'Hello world!',
    )
  })
})
