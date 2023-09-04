// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { brightYellow, gray } from 'https://deno.land/std@0.200.0/fmt/colors.ts'
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

const HEAD_TAG = '<head>'

export function render(c: Context, Component: VNode) {
  const htmlString = renderToString(Component)

  try {
    const { html, css } = extract(htmlString)
    console.log(css.length)
    const startIdxOfHeadContent = html.indexOf(HEAD_TAG)
    const endIdxOfHeadContent = html.indexOf(
      `${HEAD_TAG.at(0)}/${HEAD_TAG.slice(1)}`,
    )
    const headContent =
      startIdxOfHeadContent >= 0 && endIdxOfHeadContent >= 0 &&
        endIdxOfHeadContent > startIdxOfHeadContent
        ? html.slice(
          startIdxOfHeadContent + HEAD_TAG.length,
          endIdxOfHeadContent,
        )
        : ''
    c.res.body = html.replace(
      headContent,
      `${headContent}${css.length > 0 ? `<style>${css}</style>` : ''}`,
    )
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
