import { cheetah } from '../../cheetah.ts'
import { assertEquals } from '../deps.ts'

Deno.test('versioning', async (t) => {
  /* uri ---------------------------------------------------------------------- */

  await t.step('uri', async (t) => {
    const app = new cheetah({
      versioning: {
        current: 'v4', // latest
        type: 'uri',
      },
    })

    async function get(path: string) {
      const res = await app.fetch(new Request(`http://localhost${path}`))

      return await res.text()
    }

    // unspecified

    app.get('/1', (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/1'), 'hello from v1')
    assertEquals(await get('/v2/1'), 'hello from v2')
    assertEquals(await get('/v3/1'), 'hello from v3')
    assertEquals(await get('/v4/1'), 'hello from v4')
    assertEquals(await get('/v5/1') !== 'hello from v5', true)

    // exact

    app.get('/2', { gateway: 'v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/2') !== 'hello from v1', true)
    assertEquals(await get('/v2/2') !== 'hello from v2', true)
    assertEquals(await get('/v3/2'), 'hello from v3')
    assertEquals(await get('/v4/2') !== 'hello from v4', true)

    // smaller than

    app.get('/3', { gateway: '< v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/3'), 'hello from v1')
    assertEquals(await get('/v2/3'), 'hello from v2')
    assertEquals(await get('/v3/3') !== 'hello from v3', true)
    assertEquals(await get('/v4/3') !== 'hello from v4', true)

    // smaller than or equal to

    app.get('/4', { gateway: '<= v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/4'), 'hello from v1')
    assertEquals(await get('/v2/4'), 'hello from v2')
    assertEquals(await get('/v3/4'), 'hello from v3')
    assertEquals(await get('/v4/4') !== 'hello from v4', true)

    // greater than

    app.get('/5', { gateway: '> v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/5') !== 'hello from v1', true)
    assertEquals(await get('/v2/5') !== 'hello from v2', true)
    assertEquals(await get('/v3/5') !== 'hello from v3', true)
    assertEquals(await get('/v4/5'), 'hello from v4')

    // greater than or equal

    app.get('/6', { gateway: '>= v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/6') !== 'hello from v1', true)
    assertEquals(await get('/v2/6') !== 'hello from v2', true)
    assertEquals(await get('/v3/6'), 'hello from v3')
    assertEquals(await get('/v4/6'), 'hello from v4')

    // from (min) ... to (max)

    app.get(
      '/7',
      { gateway: 'v2...v3' },
      (c) => `hello from v${c.req.gateway}`,
    )

    assertEquals(await get('/v1/7') !== 'hello from v1', true)
    assertEquals(await get('/v2/7'), 'hello from v2')
    assertEquals(await get('/v3/7'), 'hello from v3')
    assertEquals(await get('/v4/7') !== 'hello from v4', true)

    // with base path
    const app2 = new cheetah({
      base: '/api',
      versioning: {
        current: 'v4', // latest
        type: 'uri',
      },
    })

    async function get2(path: string) {
      const res = await app2.fetch(new Request(`http://localhost${path}`))

      return await res.text()
    }

    app2.get(
      '/7',
      { gateway: 'v2...v3' },
      (c) => `hello from v${c.req.gateway}`,
    )

    assertEquals(await get2('/api/v1/7') !== 'hello from v1', true)
    assertEquals(await get2('/api/v2/7'), 'hello from v2')
    assertEquals(await get2('/api/v3/7'), 'hello from v3')
    assertEquals(await get2('/api/v4/7') !== 'hello from v4', true)
  })

  /* header ------------------------------------------------------------------- */

  await t.step('header', async () => {
    const app = new cheetah({
      versioning: {
        current: 'v4', // latest
        type: 'header',
        header: 'x-version',
      },
    })

    async function get(path: string) {
      path = path.replace('/', '')

      const res = await app.fetch(
        new Request(`http://localhost/${path.split('/')[1]}`, {
          headers: {
            'x-version': `${path.split('/')[0]}`,
          },
        }),
      )

      return await res.text()
    }

    // unspecified

    app.get('/1', (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/1'), 'hello from v1')
    assertEquals(await get('/v2/1'), 'hello from v2')
    assertEquals(await get('/v3/1'), 'hello from v3')
    assertEquals(await get('/v4/1'), 'hello from v4')
    assertEquals(await get('/v5/1') !== 'hello from v5', true)

    // exact

    app.get('/2', { gateway: 'v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/2') !== 'hello from v1', true)
    assertEquals(await get('/v2/2') !== 'hello from v2', true)
    assertEquals(await get('/v3/2'), 'hello from v3')
    assertEquals(await get('/v4/2') !== 'hello from v4', true)

    // smaller than

    app.get('/3', { gateway: '< v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/3'), 'hello from v1')
    assertEquals(await get('/v2/3'), 'hello from v2')
    assertEquals(await get('/v3/3') !== 'hello from v3', true)
    assertEquals(await get('/v4/3') !== 'hello from v4', true)

    // smaller than or equal to

    app.get('/4', { gateway: '<= v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/4'), 'hello from v1')
    assertEquals(await get('/v2/4'), 'hello from v2')
    assertEquals(await get('/v3/4'), 'hello from v3')
    assertEquals(await get('/v4/4') !== 'hello from v4', true)

    // greater than

    app.get('/5', { gateway: '> v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/5') !== 'hello from v1', true)
    assertEquals(await get('/v2/5') !== 'hello from v2', true)
    assertEquals(await get('/v3/5') !== 'hello from v3', true)
    assertEquals(await get('/v4/5'), 'hello from v4')

    // greater than or equal

    app.get('/6', { gateway: '>= v3' }, (c) => `hello from v${c.req.gateway}`)

    assertEquals(await get('/v1/6') !== 'hello from v1', true)
    assertEquals(await get('/v2/6') !== 'hello from v2', true)
    assertEquals(await get('/v3/6'), 'hello from v3')
    assertEquals(await get('/v4/6'), 'hello from v4')

    // from (min) ... to (max)

    app.get(
      '/7',
      { gateway: 'v2...v3' },
      (c) => `hello from v${c.req.gateway}`,
    )

    assertEquals(await get('/v1/7') !== 'hello from v1', true)
    assertEquals(await get('/v2/7'), 'hello from v2')
    assertEquals(await get('/v3/7'), 'hello from v3')
    assertEquals(await get('/v4/7') !== 'hello from v4', true)
  })
})
