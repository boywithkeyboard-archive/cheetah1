import { walk } from 'https://deno.land/std@0.197.0/fs/walk.ts'

for await (const entry of walk(Deno.cwd(), { exts: ['ts', 'tsx'] })) {
  if (!entry.isFile) {
    continue
  }

  let content = await Deno.readTextFile(entry.path)

  content = content.replace(
    `// Copyright ${
      new Date().getFullYear() - 1
    } Samuel Kopp. All rights reserved. Apache-2.0 license.`,
    `// Copyright ${
      new Date().getFullYear()
    } Samuel Kopp. All rights reserved. Apache-2.0 license.`,
  )

  await Deno.writeTextFile(entry.path, content)
}
