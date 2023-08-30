// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { ensureFile } from 'https://deno.land/std@0.200.0/fs/ensure_file.ts'
import { join } from 'https://deno.land/std@0.200.0/path/mod.ts'
import * as esbuild from 'https://deno.land/x/esbuild@v0.19.2/mod.js'

export async function bundle({
  input = './mod.ts',
  output = './mod.js',
  banner = '// deno-fmt-ignore-file\n// deno-lint-ignore-file',
  target = 'es2022',
  cwd = Deno.cwd(),
  runtime: _ = 'cloudflare',
}: {
  /**
   * @default './mod.ts'
   */
  input?: string
  /**
   * @default './mod.js'
   */
  output?: string
  /**
   * @default '// deno-fmt-ignore-file\n// deno-lint-ignore-file'
   */
  banner?: string
  /**
   * @default 'es2022'
   */
  target?:
    | 'es2015'
    | 'es2016'
    | 'es2017'
    | 'es2018'
    | 'es2019'
    | 'es2020'
    | 'es2021'
    | 'es2022'
  /**
   * @default Deno.cwd()
   */
  cwd?: string
  /**
   * @default 'deno'
   */
  runtime?:
    | 'cloudflare'
    | 'deno'
}) {
  const hasImportMap = async (path: string) => {
    try {
      const content = await Deno.readTextFile(join(cwd, path))

      if (!content) {
        return false
      }

      return JSON.parse(content).imports !== undefined
    } catch (_) {
      return false
    }
  }

  let options: string[] = []

  if (await hasImportMap('deno.json')) {
    options = ['--config', 'deno.json']
  } else if (await hasImportMap('deno.jsonc')) {
    options = ['--config', 'deno.jsonc']
  } else if (await hasImportMap('import_map.json')) {
    options = ['--import-map', 'deno.json']
  } else if (await hasImportMap('importMap.json')) {
    options = ['--import-map', 'importMap.json']
  } else if (await hasImportMap('imports.json')) {
    options = ['--import-map', 'imports.json']
  }

  ensureFile(output)

  const cmd = new Deno.Command('deno', {
    args: ['bundle', '-q', '--unstable', ...options, input, output],
    cwd,
  })

  await cmd.output()

  await esbuild.build({
    entryPoints: [output],
    bundle: true,
    minify: true,
    format: 'esm',
    allowOverwrite: true,
    target,
    banner: {
      js: banner,
    },
    outfile: output,
    absWorkingDir: cwd,
  })

  esbuild.stop()

  return {
    outputSize: (await Deno.readTextFile(join(cwd, output))).length,
  }
}
