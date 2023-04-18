type BenchmarkResult = {
  runtime: string
  cpu: string
  benches: {
    origin: string
    group: string | null
    name: string
    baseline: boolean
    results: {
      ok: {
        n: number
        min: number
        max: number
        avg: number
        p75: number
        p99: number
        p995: number
        p999: number
      }
    }[]
  }[]
}

const frameworks: Record<string, string> = {
  hono: 'https://github.com/honojs/hono',
  'itty-router': 'https://github.com/kwhitley/itty-router',
  'oak': 'https://github.com/oakserver/oak'
}

const encodedResult = await Deno.run({
  cmd: ['deno', 'bench', 'benchmark/basic.ts', '--allow-env', '--json'],
  stdout: 'piped'
}).output()

const result: BenchmarkResult = JSON.parse(new TextDecoder().decode(encodedResult))

const header = '\n\n| Benchmark | Time (avg) | min ... max | p75 | p99 | p995 | p999 | Diff |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n'

result.benches.shift()

let body = ''
let isFirst = true

function round(number: number, decimalPlaces: number) {
  return Number(
    Math.round(
      Number(number + 'e' + decimalPlaces),
    ) + 'e' + -decimalPlaces,
  )
}

function format(ns: number) {
  ns = Math.round(ns)

  const length = ns.toString().length

  if (length >= 4 && length < 7)
    return `${round(ns / 1000, 2)} µs`
  else if (length >= 7 && length < 10)
    return `${round(ns / 1000_000, 2)} ms`
  else
    return `${ns} ns`
}

for (const bench of result.benches) {
  let prefix

  if (isFirst) {
    prefix = '**cheetah**'
  } else {
    prefix = `[${bench.name}](${frameworks[bench.name]})`
  }

  body += `| ${prefix} | ${format(bench.results[0].ok.avg)}/run | ${format(bench.results[0].ok.min)} ... ${format(bench.results[0].ok.max)} | ${format(bench.results[0].ok.p75)} | ${format(bench.results[0].ok.p99)} | ${format(bench.results[0].ok.p995)} | ${format(bench.results[0].ok.p999)} | ${isFirst ? '...' : `**${round((result.benches[0].results[0].ok.avg - bench.results[0].ok.avg) / result.benches[0].results[0].ok.avg * 100, 2)}%**`} |\n`

  isFirst = false
}

const footer = `\n> Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: ${result.runtime.replace(' ', ' (').replace('Deno/', 'Deno ')}) — CPU: ${result.cpu.replace(' Processor', '')}\n\n`

const markdown = await Deno.readTextFile('./readme.md')

await Deno.writeTextFile(
  './readme.md',
  markdown.replace(
    markdown.substring(
      markdown.indexOf('[//]: benchmarkstart') + '[//]: benchmarkstart'.length,
      markdown.indexOf('[//]: benchmarkend')
    ),
    header + body + footer
  )
)
