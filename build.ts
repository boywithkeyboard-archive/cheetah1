import { build, stop } from 'https://deno.land/x/esbuild@v0.17.18/mod.js'

async function isImportMap(path: string) {
  try {
    const content = await Deno.readTextFile(path)

    if (!content)
      return false

    return JSON.parse(content).imports !== undefined
  } catch (_) {
    return false
  }
}

let args: string[] = []

if (await isImportMap('deno.json'))
  args = ['--config', 'deno.json']
else if (await isImportMap('deno.jsonc'))
  args = ['--config', 'deno.jsonc']
else if (await isImportMap('import_map.json'))
  args = ['--import-map', 'deno.json']
else if (await isImportMap('importMap.json'))
  args = ['--import-map', 'importMap.json']
else if (await isImportMap('imports.json'))
  args = ['--import-map', 'imports.json']

const cmd = new Deno.Command('deno', {
  args: ['bundle', '-q', ...args, Deno.args[0] ?? './mod.ts', Deno.args[1] ?? './mod.js']
})

await cmd.output()

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
