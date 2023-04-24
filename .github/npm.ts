import { build, emptyDir } from 'https://deno.land/x/dnt@0.34.0/mod.ts'

await emptyDir('npm')

await build({
  entryPoints: [
    './node/mod.ts',
    './validator/typebox.ts',
    './validator/zod.ts'
  ],
  outDir: './npm',
  shims: {
    deno: true
  },
  compilerOptions: {
    lib: [
      'dom',
      'dom.iterable',
      'es2022'
    ]
  },
  skipSourceOutput: true,
  test: false,
  typeCheck: false,
  scriptModule: false,
  package: {
    name: '@azury/cheetah',
    version: Deno.args[0],
    description: '🐈 A blazing fast framework for the modern web.',
    license: 'Apache-2.0',
    repository: 'azurystudio/cheetah',
    bugs: 'https://github.com/azurystudio/cheetah/issues'
  },
  async postBuild() {
    await Deno.copyFile('license', 'npm/license')
    await Deno.copyFile('readme.md', 'npm/readme.md')
  }
})
