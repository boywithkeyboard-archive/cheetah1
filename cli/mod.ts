import { parse } from 'https://deno.land/std@0.198.0/flags/mod.ts'
import { bundleCommand } from './commands/bundle.ts'
import { createCommand } from './commands/create.ts'
import { newCommand } from './commands/new.ts'
import { serveCommand } from './commands/serve.ts'
import { log } from './utils.ts'

const args = parse(Deno.args)

if (args._[0] === 'bundle') {
  bundleCommand(args)
} else if (args._[0] === 'create') {
  createCommand(args)
} else if (args._[0] === 'new') {
  newCommand()
} else if (args._[0] === 'serve') {
  serveCommand(args)
} else {
  log.error('unknown command')
}
