await Deno.run({ cmd: ['deno', 'run', '-A', 'build.ts'] }).status()

const length = (await Deno.readTextFile('mod.js')).length / 1000

await Deno.remove('mod.js')

console.log(
  Number(
    Math.round(
      Number(length + 'e' + 2),
    ) + 'e' + -2
  )
  + ' kB'
)
