// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { parse } from 'std/flags/mod.ts'
import { bundleCommand } from './cmd/bundle/mod.ts'
import { newCommand } from './cmd/new/mod.ts'
import { randomCommand } from './cmd/random/mod.ts'
import { serveCommand } from './cmd/serve/mod.ts'
import { logError } from './utils.ts'

const args = parse(Deno.args)

if (args._[0] === 'bundle') {
  bundleCommand(args)
} else if (args._[0] === 'random') {
  randomCommand()
} else if (args._[0] === 'new') {
  newCommand()
} else if (args._[0] === 'serve') {
  serveCommand(args)
} else {
  logError('unknown command')
}
