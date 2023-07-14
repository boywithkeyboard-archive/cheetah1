import { gray, white } from 'https://deno.land/std@0.194.0/fmt/colors.ts'

export function bench(name: string, func: () => unknown) {
  const t0 = performance.now()

  func()

  const t1 = performance.now()

  console.log(gray(`${white(name)} - ${t1 - t0}ms`))
}

bench('Set: for ... of', () => {
  const set = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])

  for (const i of set) {
    console.log(i)
  }
})
bench('Set: for ... of Set.values()', () => {
  const set = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])

  for (const i of set.values()) {
    console.log(i)
  }
})
bench('new Response', () => {
  new Response(null, {
    status: 307,
    headers: {
      location: 'https://google.com',
    },
  })
})

bench('Response.redirect', () => {
  Response.redirect('https://google.com', 307)
})
