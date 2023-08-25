// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { format } from 'https://deno.land/std@0.200.0/fmt/bytes.ts'
import {
  brightBlue,
  brightGreen,
  brightRed,
  gray,
  white,
} from 'https://deno.land/std@0.200.0/fmt/colors.ts'
import { createExtension } from '../mod.ts'

/**
 * An extension to log every response (that didn't throw an exception).
 *
 * @since v1.0
 */
export const debug = createExtension({
  onResponse({ c }) {
    const code = c.res.code.toString()

    console.info(
      gray(
        `${
          code.startsWith('3')
            ? brightBlue(c.res.code.toString())
            : code.startsWith('2')
            ? brightGreen(c.res.code.toString())
            : brightRed(c.res.code.toString())
        } - ${c.req.method} ${white(new URL(c.req.raw.url).pathname)}${
          c.res.bodySize > -1 ? ` (${format(c.res.bodySize)})` : ''
        }`,
      ),
    )
  },
})
