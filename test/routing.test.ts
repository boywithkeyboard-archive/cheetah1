import { assertEquals } from 'https://deno.land/std@v0.186.0/testing/asserts.ts'
import cheetah, { Collection } from '../mod.ts'

Deno.test('Nesting/Routing', async () => {
  const collection = new Collection()
    .get('/', () => 'nested root route')
    .get('/nestedroute', () => 'nested route')

  // root with base path
  const r1 = new cheetah({
    base: '/api'
  })
    .use('/collection', collection)

  assertEquals(await (await r1.fetch(new Request('http://localhost:3000/api/collection'))).text(), 'nested root route')
  assertEquals(await (await r1.fetch(new Request('http://localhost:3000/api/collection/nestedroute'))).text(), 'nested route')

  // root without base path
  const r2 = new cheetah()
    .use('/collection', collection)

  assertEquals(await (await r2.fetch(new Request('http://localhost:3000/collection'))).text(), 'nested root route')
  assertEquals(await (await r2.fetch(new Request('http://localhost:3000/collection/nestedroute'))).text(), 'nested route')
})
