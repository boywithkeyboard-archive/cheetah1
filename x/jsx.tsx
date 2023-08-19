// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { default as renderToString } from 'https://esm.sh/preact-render-to-string@6.1.0?deps=preact@10.16.0'
import { h, VNode } from 'https://esm.sh/preact@10.17.0'
import { extract } from 'https://esm.sh/@twind/core@1.1.3'

import { Context } from '../mod.ts'

export function jsx(c: Context, Component: (() => h.JSX.Element) | VNode) {
  const html$ = renderToString(
    Component instanceof Function ? <Component /> : Component,
  );
  try {
    const { html, css } = extract(html$) // twind throws error when trying to extract if it is not installed
    c.res.body = `<style>${css}</style><body>${html}</body>`
  } catch (e) {
    c.res.body = html$;
  }
  c.res.header('content-type', 'text/html; charset=utf-8')
}

export { h } from 'https://esm.sh/preact@10.17.0'
