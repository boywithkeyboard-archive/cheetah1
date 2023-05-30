import { parse } from 'https://deno.land/std@0.190.0/flags/mod.ts'
import { brightRed, gray } from 'https://deno.land/std@0.190.0/fmt/colors.ts'
import { build, stop } from 'https://deno.land/x/esbuild@v0.17.19/mod.js'

try {
  const { _ } = parse(Deno.args)
  
  const isImportMap = async (path: string) => {
    try {
      const content = await Deno.readTextFile(path)
  
      if (!content)
        return false
  
      return JSON.parse(content).imports !== undefined
    } catch (_) {
      return false
    }
  }

  let options: string[] = []

  if (await isImportMap('deno.json'))
    options = ['--config', 'deno.json']
  else if (await isImportMap('deno.jsonc'))
    options = ['--config', 'deno.jsonc']
  else if (await isImportMap('import_map.json'))
    options = ['--import-map', 'deno.json']
  else if (await isImportMap('importMap.json'))
    options = ['--import-map', 'importMap.json']
  else if (await isImportMap('imports.json'))
    options = ['--import-map', 'imports.json']

  const cmd = new Deno.Command('deno', {
    args: ['bundle', '-q', ...options, (_[0] as string) ?? './mod.ts', (_[1] as string) ?? './mod.js']
  })
  
  await cmd.output()
  
  await build({
    entryPoints: [(_[1] as string) ?? './mod.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    allowOverwrite: true,
    banner: {
      js: '// deno-fmt-ignore-file\n// deno-lint-ignore-file',
    },
    outfile: (_[1] as string) ?? './mod.js'
  })
  
  stop()
} catch (err) {
  console.error(gray(`${brightRed('error')} - ${typeof err === 'string' ? err : 'unknown exception'}`))
}
