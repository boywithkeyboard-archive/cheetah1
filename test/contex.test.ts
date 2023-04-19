import { assertEquals } from 'https://deno.land/std@v0.184.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('Context', async t => {
  Deno.env.set('cheetah_test', 'test')

  const app = new cheetah()

  await t.step('c.env', async () => {
    app.get('/env', c => c.env)
    assertEquals((await (await app.fetch((new Request('http://localhost:3000/env')))).json()).cheetah_test, 'test')
  })
})
