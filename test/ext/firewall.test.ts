import { assertEquals } from 'std/assert/mod.ts'
import { firewall } from '../../ext/firewall.ts'
import cheetah from '../../mod.ts'

Deno.test('ext/firewall', async (t) => {
  await t.step('vpn', async () => {
    const app = new cheetah({ proxy: 'cloudflare' })

    app.use(firewall({
      blockVPN: true,
    }))

    const res = await app.fetch(
      new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '2.56.16.0',
        },
      }),
    )

    assertEquals(res.status, 403)
  })
})

Deno.test('datacenters', async () => {
  const app = new cheetah({ proxy: 'cloudflare' })

  app.use(firewall({
    blockDatacenter: true,
  }))

  const res = await app.fetch(
    new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '1.12.32.0',
      },
    }),
  )

  assertEquals(res.status, 403)
})

Deno.test('customRanges', async () => {
  const app = new cheetah({ proxy: 'cloudflare' })

  app.use(firewall({
    customRanges: [
      '1.2.3.4/32',
    ],
  }))

  const res = await app.fetch(
    new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '1.2.3.4',
      },
    }),
  )

  assertEquals(res.status, 403)
})
