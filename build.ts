import { build, stop } from 'https://deno.land/x/esbuild@v0.17.16/mod.js'
import { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts'

await build({
  // @ts-ignore:
  plugins: [denoPlugin()],
  entryPoints: ['./mod.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  banner: {
    js: '// deno-lint-ignore-file',
  },
  outfile: './worker.js',
})

stop()
