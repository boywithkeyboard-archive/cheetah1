// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { brightYellow, gray } from 'https://deno.land/std@0.199.0/fmt/colors.ts'
import {
  defineConfig,
  extract,
  install,
} from 'https://esm.sh/@twind/core@1.1.3'
import presetAutoPrefix from 'https://esm.sh/@twind/preset-autoprefix@1.0.7'
import presetTailwind from 'https://esm.sh/@twind/preset-tailwind@1.1.4'
import renderToString from 'https://esm.sh/preact-render-to-string@6.1.0?deps=preact@10.17.1&target=es2022'
import { VNode } from 'https://esm.sh/preact@10.17.1?target=es2022'
import { Context } from './mod.ts'

export function render(c: Context, Component: VNode) {
  const htmlString = renderToString(Component)

  try {
    const { html, css } = extract(htmlString)

    c.res.body = `<style>${css}</style><body>${html}</body>`
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
