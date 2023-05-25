import { walk } from 'https://deno.land/std@0.188.0/fs/walk.ts'
import byte from 'https://deno.land/x/byte@v3.3.0/byte.ts'
import { build, stop } from 'https://deno.land/x/esbuild@v0.17.19/mod.js'

// update module sizes

async function getMinifiedFileSize(path: string) {
  const outpath = `${path}.js`

  const cmd = new Deno.Command('deno', {
    args: [
      'bundle',
      '-q',
      `${path}.ts`,
      `${outpath}`
    ]
  })

  await cmd.output()
  
  await build({
    entryPoints: [outpath],
    bundle: true,
    minify: true,
    format: 'esm',
    allowOverwrite: true,
    outfile: outpath
  })

  const size = (await Deno.readTextFile(outpath)).length

  await Deno.remove(outpath)
  
  return byte(size)
}

const coreSize = await getMinifiedFileSize('mod')
const typeboxValidatorSize = await getMinifiedFileSize('validator/typebox')
const zodValidatorSize = await getMinifiedFileSize('validator/zod')
const xSize = await getMinifiedFileSize('x/mod')

stop()

await Deno.writeTextFile('./guide/reasons/light.md', `[← readme](https://github.com/azurystudio/cheetah#readme)\n\n## Lightweight\n\n| Module | Size |\n| --- | --- |\n| Core | ${coreSize} |\n| Validator (TypeBox) | ${typeboxValidatorSize} |\n| Validator (Zod) | ${zodValidatorSize} |\n| Accessories | ${xSize} |\n`)

// update imports

for await (const { path, isFile } of walk('guide')) {
  if (!isFile)
    continue

  const content = await Deno.readTextFile(path)

  await Deno.writeTextFile(path, content.replaceAll(`https://deno.land/x/cheetah@${Deno.args[0]}`, `https://deno.land/x/cheetah@${Deno.args[1]}`))
}

for await (const { path, isFile } of walk('templates')) {
  if (!isFile)
    continue

  const content = await Deno.readTextFile(path)

  await Deno.writeTextFile(path, content.replaceAll(`https://deno.land/x/cheetah@${Deno.args[0]}`, `https://deno.land/x/cheetah@${Deno.args[1]}`))
}

const content = await Deno.readTextFile('readme.md')

await Deno.writeTextFile('readme.md', content.replaceAll(`https://deno.land/x/cheetah@${Deno.args[0]}`, `https://deno.land/x/cheetah@${Deno.args[1]}`))
