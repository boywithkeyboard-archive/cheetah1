// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import {
  prerelease,
  rcompare,
} from 'https://deno.land/std@0.191.0/semver/mod.ts#pin'
import { gray, white } from 'https://deno.land/std@0.199.0/fmt/colors.ts'

async function bench(url: string) {
  const a = new Deno.Command('deno', {
    args: ['run', '-A', '--unstable', 'bench/server.ts', url],
  })

  const server = a.spawn()

  const b = new Deno.Command('oha', {
    args: [
      '-n',
      '25000',
      '-c',
      '50',
      '-j',
      '--no-tui',
      'http://127.0.0.1:8000',
    ],
    stdout: 'piped',
  })

  const { stdout } = await b.output()

  server.kill()

  return JSON.parse(new TextDecoder().decode(stdout))
}

async function getLatestVersion(): Promise<string> {
  const res = await fetch('https://apiland.deno.dev/v2/modules/cheetah')

  const { versions } = await res.json() as { versions: string[] }

  return versions.filter((v) => {
    return !prerelease(v)
  }).sort(
    rcompare,
  )[0]
}

const latestVersion = await getLatestVersion()

const current = await bench(
  `https://deno.land/x/cheetah@${latestVersion}/mod.ts`,
)

const canary = await bench('../mod.ts')

console.clear()

console.log(
  gray(
    `${white('◆ current')} ${Math.round(current.rps.mean)} rps\n${
      white('◇ canary')
    } ${Math.round(canary.rps.mean)} rps`,
  ),
)
