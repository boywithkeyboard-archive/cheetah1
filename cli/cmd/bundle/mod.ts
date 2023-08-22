// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { parse } from 'https://deno.land/std@0.199.0/flags/mod.ts'
import {
  brightGreen,
  brightRed,
  brightYellow,
  gray,
} from 'https://deno.land/std@0.199.0/fmt/colors.ts'
import byte from 'https://deno.land/x/byte@v3.3.0/byte.ts'
import { logError } from '../../utils.ts'
import { bundle } from './bundle.ts'

export async function bundleCommand(args: ReturnType<typeof parse>) {
  const { _, target, runtime } = args

  const input = _[1] && typeof _[1] === 'string' ? _[1] : undefined
  const output = _[2] && typeof _[2] === 'string' ? _[2] : undefined

  try {
    const { outputSize } = await bundle({
      input,
      output,
      // @ts-ignore:
      target: typeof target === 'string' ? target : undefined,
      // @ts-ignore:
      runtime: typeof runtime === 'string' ? runtime : undefined,
    })

    console.info(
      gray(
        `file size - ${
          outputSize < 1_000_000
            ? brightGreen(byte(outputSize))
            : outputSize < 5_000_000
            ? brightYellow(byte(outputSize))
            : brightRed(byte(outputSize))
        }`,
      ),
    )
  } catch (err) {
    if (err instanceof Error) {
      logError(err.message)
    } else {
      logError('something went wrong trying to bundle your app.')
    }
  }
}
