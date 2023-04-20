import { build, stop } from 'https://deno.land/x/esbuild@v0.17.17/mod.js'

await Deno.run({ cmd: ['deno', 'bundle', '-q', Deno.args[0] ?? './mod.ts', Deno.args[1] ?? './mod.js'] }).status()

await build({
  entryPoints: [Deno.args[1] ?? './mod.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  allowOverwrite: true,
  banner: {
    js: '// deno-fmt-ignore-file\n// deno-lint-ignore-file',
  },
  outfile: Deno.args[1] ?? './mod.js',
})

stop()
