// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { loadSync } from 'https://deno.land/std@0.198.0/dotenv/mod.ts'
import { parse } from 'https://deno.land/std@0.198.0/flags/mod.ts'
import { brightGreen, gray } from 'https://deno.land/std@0.198.0/fmt/colors.ts'
import {
  keypress,
  KeyPressEvent,
} from 'https://deno.land/x/cliffy@v0.25.7/keypress/mod.ts'
import { cheetah } from '../../cheetah.ts'
import { log } from '../utils.ts'

export async function serveCommand(args: ReturnType<typeof parse>) {
  if (typeof args._[1] !== 'string') {
    return log.error('please specify an entry point')
  }

  loadSync({ export: true })

  Deno.env.set('DEV', 'true')

  const exports = await import(args._[1] as string)

  let childProcess: Deno.ChildProcess

  if (exports.fetch || exports.default && exports.default instanceof cheetah) {
    if (exports.fetch) {
      Deno.writeTextFileSync(
        './__app.js',
        `const { fetch: f } = await import('${
          args._[1]
        }')\nDeno.serve((r, d) => f(r, d))`,
      )

      const cmd = new Deno.Command('deno', {
        args: ['run', '-A', '--watch', '__app.js'],
      })

      childProcess = cmd.spawn()
    } else {
      Deno.writeTextFileSync(
        './__app.js',
        `const { default: a } = await import('${
          args._[1]
        }')\nDeno.serve((r, d) => a.fetch(r, d))`,
      )

      const cmd = new Deno.Command('deno', {
        args: ['run', '-A', '--watch', '__app.js'],
      })

      childProcess = cmd.spawn()
    }
  } else {
    const cmd = new Deno.Command('deno', {
      args: ['run', '-A', '--watch', args._[1]],
    })

    childProcess = cmd.spawn()
  }

  console.info(gray(`${brightGreen('success')} - press CTRL+C to exit`))

  for await (const e of keypress()) {
    const { ctrlKey, key } = e as KeyPressEvent

    if (ctrlKey && key === 'c' || key === 'escape') {
      try {
        Deno.removeSync('./__app.js')
      } catch (_err) {
        //
      }

      childProcess.kill()

      Deno.exit()
    }
  }
}
