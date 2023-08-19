// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { brightYellow, gray } from 'https://deno.land/std@0.198.0/fmt/colors.ts'
import { extract } from 'https://esm.sh/@twind/core@1.1.3?target=es2022'
import { default as renderToString } from 'https://esm.sh/preact-render-to-string@6.1.0?deps=preact@10.17.0&target=es2022'
import { h, VNode } from 'https://esm.sh/preact@10.17.0?target=es2022'
import { Context } from './mod.ts'

export function render(c: Context, Component: (() => h.JSX.Element) | VNode) {
  const htmlString = renderToString(
    Component instanceof Function ? <Component /> : Component,
  )

  try {
    const { html, css } = extract(htmlString) // twind throws error when trying to extract if it is not installed

    c.res.body = `<style>${css}</style><body>${html}</body>`
  } catch (e) {
    if (c.dev) {
      console.warn(
        gray(
          `${
            brightYellow('warning')
          } - twind is not installed, thus styles might not be applied`,
        ),
      )
    }

    c.res.body = htmlString
  }

  c.res.header('content-type', 'text/html; charset=utf-8')
}

export { h } from 'https://esm.sh/preact@10.17.0?target=es2022'
