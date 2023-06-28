import {
  prerelease,
  rcompare,
} from 'https://deno.land/std@0.191.0/semver/mod.ts#pin'

async function bench(url: string) {
  const a = new Deno.Command('deno', {
    args: ['run', '-A', '--unstable', 'bench/server.ts', url],
  })

  const server = a.spawn()

  const b = new Deno.Command('oha', {
    args: ['-z', '15s', '-c', '50', '-j', 'http://localhost:8000'],
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

const next = await bench('../mod.ts')

const readme = await Deno.readTextFile('./readme.md')

let table =
  '| Channel | Avg | Max | p75 | p90 | p95 | p99 |\n| --- | --- | --- | --- | --- | --- | --- |\n'

table +=
  `| ◆ [**current**](https://deno.land/x/cheetah@${latestVersion}) <sup>${latestVersion}</sup> | ${
    Math.round(current.rps.mean)
  } | ${Math.round(current.rps.max)} | ${
    Math.round(current.rps.percentiles.p75)
  } | ${Math.round(current.rps.percentiles.p90)} | ${
    Math.round(current.rps.percentiles.p95)
  } | ${Math.round(current.rps.percentiles.p99)} |\n`

table += `| ◇ [**canary**](https://deno.land/x/cheetah${
  Deno.args[0] ? `@${Deno.args[0]}` : ''
})${Deno.args[0] ? `<sup>${Deno.args[0]}</sup>` : ''} | ${
  Math.round(next.rps.mean)
} | ${Math.round(next.rps.max)} | ${Math.round(next.rps.percentiles.p75)} | ${
  Math.round(next.rps.percentiles.p90)
} | ${Math.round(next.rps.percentiles.p95)} | ${
  Math.round(next.rps.percentiles.p99)
} |`

await Deno.writeTextFile(
  './readme.md',
  readme.replace(
    readme.substring(
      readme.indexOf('[//]: bstart\n\n') + '[//]: bstart\n\n'.length,
      readme.indexOf('\n\n[//]: bend'),
    ),
    table,
  ),
)
