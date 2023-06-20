import {
  brightGreen,
  brightRed,
  gray,
} from 'https://deno.land/std@0.192.0/fmt/colors.ts'
import { Select } from 'https://deno.land/x/cliffy@v0.25.7/prompt/select.ts'
import { decompress } from 'https://deno.land/x/zip@v1.2.5/mod.ts'

async function setup() {
  const runtime = await Select.prompt({
    message: 'What runtime do you use?',
    options: [
      { name: 'Deno', value: 'deno' },
      { name: 'Cloudflare Workers', value: 'cloudflare' },
    ],
  })

  const template = 'template-{runtime}-basic'

  // const template = await Select.prompt({
  //   message: 'What template do you want to use?',
  //   options: [
  //     { name: 'Basic', value: 'template-{runtime}-basic' }
  //   ]
  // })

  const response = await fetch(
    `https://github.com/cheetahland/${
      template.replace('{runtime}', runtime)
    }/zipball/main`,
  )

  if (!response.body) {
    return console.error(
      gray(`${brightRed('error')} - Failed to fetch template!`),
    )
  }

  await Deno.writeFile('./template.zip', response.body)

  const isUnzippingSuccessful = await decompress('./template.zip', './')

  if (!isUnzippingSuccessful) {
    return console.error(
      gray(`${brightRed('error')} - Failed to unzip template!`),
    )
  }

  await Deno.remove('./template.zip')

  console.info(
    gray(
      `${brightGreen('success')} - please read the readme.md to get started.`,
    ),
  )
}

if (import.meta.main) {
  setup()
}
