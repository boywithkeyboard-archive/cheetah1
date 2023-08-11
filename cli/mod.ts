import { drgn } from 'https://deno.land/x/drgn@v0.10.2/drgn.ts'
import { analyzeCommand } from './cmd/analyze.ts'
import { bundleCommand } from './cmd/bundle.ts'
import { deployCommand } from './cmd/deploy.ts'
import { newCommand } from './cmd/new.ts'

new drgn()
  .command(analyzeCommand)
  .command(bundleCommand)
  .command(deployCommand)
  .command(newCommand)
  .run()
