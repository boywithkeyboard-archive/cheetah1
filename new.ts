import { parse } from 'https://deno.land/std@v0.185.0/flags/mod.ts'
import { brightRed } from 'https://deno.land/std@v0.185.0/fmt/colors.ts'

const args = parse(Deno.args)

async function download(prefix: string, ...paths: string[]) {
  for (const path of paths) {
    const response = await fetch(`https://raw.githubusercontent.com/azurystudio/cheetah/dev/templates/${prefix}/${path}`)

    if (path.includes('/')) {
      await Deno.mkdir(path.substring(1, path.lastIndexOf('/')), { recursive: true })
      await Deno.rename(path.substring(1, path.lastIndexOf('/')).replace('/', ''), path.substring(1, path.lastIndexOf('/')))
    }

    await Deno.writeTextFile(path, await response.text())
  }
}

if (args.template === 'deno') {
  await download(
    'deno',
    
    '.github/workflows/bump.yml',
    '.vscode/settings.json',
    'readme.md',
    'deno.json',
    'mod.ts'
  )
} else if (args.template === 'cloudflare') {
  await download(
    'cloudflare',

    '.github/workflows/bump.yml',
    '.vscode/settings.json',
    'readme.md',
    'deno.json',
    'mod.ts',
    'wrangler.toml',
    '.gitignore'
  )
} else {
  console.error(brightRed('cannot find template'))
}
