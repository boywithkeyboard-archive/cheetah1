import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import cheetah, { Collection } from '../mod.ts'

Deno.test('Nesting/Routing', async t => {
  const collection = new Collection()
    .get('/', () => 'nested root route')
    .get('/nestedroute', () => 'nested route')

  await t.step('Root with Base Path', async () => {
    const r1 = new cheetah({
      base: '/api'
    })
      .use('/collection', collection)
  
    assertEquals(await (await r1.fetch(new Request('http://localhost:3000/api/collection'))).text(), 'nested root route')
    assertEquals(await (await r1.fetch(new Request('http://localhost:3000/api/collection/nestedroute'))).text(), 'nested route')
  })

  await t.step('Root without Base Path', async () => {
    const r2 = new cheetah()
      .use('/collection', collection)

    assertEquals(await (await r2.fetch(new Request('http://localhost:3000/collection'))).text(), 'nested root route')
    assertEquals(await (await r2.fetch(new Request('http://localhost:3000/collection/nestedroute'))).text(), 'nested route')
  })
})
