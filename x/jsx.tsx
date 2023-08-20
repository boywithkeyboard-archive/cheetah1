// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
/** @jsx h */
import { default as renderToString } from 'https://esm.sh/preact-render-to-string@6.1.0?deps=preact@10.16.0'
import { h, VNode } from 'https://esm.sh/preact@10.17.1'

import { Context } from '../mod.ts'

export function jsx(c: Context, Component: (() => h.JSX.Element) | VNode) {
  c.res.body = renderToString(
    Component instanceof Function ? <Component /> : Component,
  )
  c.res.header('content-type', 'text/html; charset=utf-8')
}

export { h } from 'https://esm.sh/preact@10.17.1'
