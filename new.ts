import { parse } from 'https://deno.land/std@0.190.0/flags/mod.ts'
import { brightRed } from 'https://deno.land/std@0.190.0/fmt/colors.ts'

const args = parse(Deno.args)

async function download(prefix: string, ...paths: string[]) {
  for (const path of paths) {
    const response = await fetch(`https://raw.githubusercontent.com/boywithkeyboard/cheetah_${prefix}/dev/${path}`)

    if (path.includes('/'))
      await Deno.mkdir(path.substring(0, path.lastIndexOf('/')), { recursive: true })

    await Deno.writeTextFile(path, await response.text())
  }
}

if (args.template === 'deno') {
  await download(
    'deno',

    '.vscode/settings.json',
    'readme.md',
    'deno.json',
    'mod.ts'
  )
} else if (args.template === 'cloudflare') {
  await download(
    'cloudflare',

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
