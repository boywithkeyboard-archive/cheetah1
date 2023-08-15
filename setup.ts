// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { ensureFile } from 'https://deno.land/std@0.198.0/fs/ensure_file.ts'
import { Select } from 'https://deno.land/x/cliffy@v0.25.7/mod.ts'

type VSCodeSettings = {
  files: string[]
  vscode: Record<string, unknown>
  imports: string[]
}
// TODO delete file
async function setup() {
  const platform = await Select.prompt({
    message: 'Where do you plan to deploy your app?',
    options: [
      { name: 'Deno 🦕', value: 'deno' },
      { name: 'Cloudflare Workers ⚡', value: 'cloudflare' },
    ],
  })

  let url =
    `https://raw.githubusercontent.com/boywithkeyboard/templates/dev/${platform}/`

  url += 'starter/'

  const meta: VSCodeSettings = JSON.parse(
    await (await fetch(url + 'meta.json')).text(),
  )

  const importMap: Record<string, string> = JSON.parse(
    await (await fetch(
      'https://raw.githubusercontent.com/boywithkeyboard/templates/dev/deno.json',
    )).text(),
  ).imports

  for (const f of meta.files) {
    const res = await fetch(url + f)

    await ensureFile(f)
    await Deno.writeTextFile(f, await res.text())
  }

  const imports = {}

  for (const i of meta.imports) {
    // @ts-ignore:
    imports[i] = importMap[i]
  }

  await ensureFile('.vscode/settings.json')
  await Deno.writeTextFile('.vscode/settings.json', JSON.stringify(meta.vscode))

  if (platform === 'cloudflare') {
    await Deno.writeTextFile(
      'wrangler.toml',
      `name = "<name>"
account_id = "<account_id>"
route = "<route>"
compatibility_date = "2023-03-24"
    
[build]
command = "deno task build"`,
    )
  }

  const version =
    (await (await fetch('https://apiland.deno.dev/v2/modules/cheetah')).json())
      .latest_version

  await Deno.writeTextFile(
    'deno.json',
    JSON.stringify(
      {
        fmt: {
          semiColons: false,
          singleQuote: true,
        },
        imports,
        tasks: {
          build: `deno run -A https://deno.land/x/cheetah@${version}/build.ts`,
        },
      },
      null,
      2,
    ),
  )

  const command = new Deno.Command('deno', {
    args: ['fmt', '--single-quote', '--no-semicolons'],
    stdout: 'piped',
  })

  command.spawn()
}

if (import.meta.main) {
  setup()
}
