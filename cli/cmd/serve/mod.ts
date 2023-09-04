// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { keypress, KeyPressEvent } from 'cliffy/keypress'
import { loadSync } from 'std/dotenv/mod.ts'
import { parse } from 'std/flags/mod.ts'
import { brightGreen, gray, white } from 'std/fmt/colors.ts'
import { cheetah } from '../../../cheetah.ts'
import { logError } from '../../utils.ts'

export async function serveCommand(args: ReturnType<typeof parse>) {
  if (typeof args._[1] !== 'string') {
    return logError('please specify an entry point')
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

  console.info(
    gray(`${brightGreen('success')} - press ${white('CTRL+C')} to exit`),
  )

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
