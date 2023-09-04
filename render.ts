// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { VNode } from 'preact'
import renderToString from 'preact/render-to-string'
import { brightYellow, gray } from 'std/fmt/colors.ts'
import { defineConfig, extract, install } from 'twind'
import presetAutoPrefix from 'twind/preset-autoprefix'
import presetTailwind from 'twind/preset-tailwind'
import { Context } from './mod.ts'

export function render(c: Context, Component: VNode) {
  const htmlString = renderToString(Component)
  try {
    const { html, css } = extract(htmlString)
    c.res.body = `${css.length > 0 ? `<style>${css}</style>` : ''}${html}`
  } catch (_err) {
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

export class Renderer {
  render

  constructor(options?: Parameters<typeof defineConfig>[0]) {
    if (options) {
      options.presets = options.presets
        ? [presetAutoPrefix(), presetTailwind(), ...options.presets]
        : [presetAutoPrefix(), presetTailwind()]
    }

    install(defineConfig(
      options ?? {
        presets: [presetAutoPrefix(), presetTailwind()],
      },
    ))

    this.render = render
  }
}

export { h } from 'https://esm.sh/preact@10.17.1?target=es2022'
