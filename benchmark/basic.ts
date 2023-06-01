import { Hono } from 'https://deno.land/x/hono@v3.2.3/mod.ts'
import { Application, Router } from 'https://deno.land/x/oak@v12.5.0/mod.ts'
import { Router as IttyRouter } from 'https://esm.sh/itty-router@4.0.9'
import cheetah from '../mod.ts'

Deno.bench('noop', () => {})

Deno.bench('cheetah', { group: 'timing', baseline: true }, async () => {
  const app = new cheetah()

  app.get('/user', () => 'User')

  app.get('/user/comments', () => 'User Comments')

  app.get('/user/avatar', () => 'User Avatar')

  app.get('/user/lookup/email/:address', c => c.req.param('address'))

  app.post('/status', () => 'Status')

  app.get('/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends', () => 'Very Deeply Nested Route')

  app.get('/user/lookup/username/:username', c => ({ message: `Hello ${c.req.param('username')}` }))

  const r1 = new Request('http://localhost:3000/user')
  await app.fetch(r1)

  const r2 = new Request('http://localhost:3000/user/comments')
  await app.fetch(r2)

  const r3 = new Request('http://localhost:3000/user/avatar')
  await app.fetch(r3)

  const r4 = new Request('http://localhost:3000/user/lookup/email/benchmark')
  await app.fetch(r4)

  const r5 = new Request('http://localhost:3000/status', { method: 'POST' })
  await app.fetch(r5)

  const r6 = new Request('http://localhost:3000/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends')
  await app.fetch(r6)

  const r7 = new Request('http://localhost:3000/user/lookup/username/johndoe')
  await app.fetch(r7)
})

Deno.bench('hono', { group: 'timing' }, async () => {
  const app = new Hono()

  app.get('/user', c => c.text('User'))

  app.get('/user/comments', c => c.text('User Comments'))

  app.get('/user/avatar', c => c.text('User Avatar'))

  app.get('/user/lookup/email/:address', c => c.text(c.req.param('address')))

  app.post('/status', c => c.text('Status'))

  app.get('/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends', (c) => c.text('Very Deeply Nested Route'))

  app.get('/user/lookup/username/:username', c => c.json({ message: `Hello ${c.req.param('username')}` }))

  const r1 = new Request('http://localhost:3000/user')
  await app.fetch(r1)

  const r2 = new Request('http://localhost:3000/user/comments')
  await app.fetch(r2)

  const r3 = new Request('http://localhost:3000/user/avatar')
  await app.fetch(r3)

  const r4 = new Request('http://localhost:3000/user/lookup/email/benchmark')
  await app.fetch(r4)

  const r5 = new Request('http://localhost:3000/status', { method: 'POST' })
  await app.fetch(r5)

  const r6 = new Request('http://localhost:3000/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends')
  await app.fetch(r6)

  const r7 = new Request('http://localhost:3000/user/lookup/username/johndoe')
  await app.fetch(r7)
})

Deno.bench('itty-router', { group: 'timing' }, async () => {
  const router = IttyRouter()

  router.get('/user', () => {
    return new Response('User', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.get('/user/comments', () => {
    return new Response('User Comments', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.get('/user/avatar', () => {
    return new Response('User Avatar', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.get('/user/lookup/email/:address', req => {
    return new Response(req.params.address, {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.post('/status', () => {
    return new Response('Status', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.get('/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends', () => {
    return new Response('Very Deeply Nested Route', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })

  router.get('/user/lookup/username/:username', req => {
    return new Response(JSON.stringify({ message: `Hello ${req.params.username}` }), {
      headers: {
        'content-type': 'application/json; charset=utf-8'
      }
    })
  })

  const r1 = new Request('http://localhost:3000/user')
  await router.handle(r1)

  const r2 = new Request('http://localhost:3000/user/comments')
  await router.handle(r2)

  const r3 = new Request('http://localhost:3000/user/avatar')
  await router.handle(r3)

  const r4 = new Request('http://localhost:3000/user/lookup/email/benchmark')
  await router.handle(r4)

  const r5 = new Request('http://localhost:3000/status', { method: 'POST' })
  await router.handle(r5)

  const r6 = new Request('http://localhost:3000/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends')
  await router.handle(r6)

  const r7 = new Request('http://localhost:3000/user/lookup/username/johndoe')
  await router.handle(r7)
})

Deno.bench('oak', { group: 'timing' }, async () => {
  const app = new Application()

  const router = new Router()

  router.get('/user', c => {
    c.response.body = 'User'
  })

  router.get('/user/comments', c => {
    c.response.body = 'User Comments'
  })

  router.get('/user/avatar', c => {
    c.response.body = 'User Avatar'
  })

  router.get('/user/lookup/email/:address', c => {
    c.response.body = Object.fromEntries(c.request.url.searchParams).address
  })

  router.post('/status', c => {
    c.response.body = 'Status'
  })

  router.get('/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends', c => {
    c.response.body = 'Very Deeply Nested Route'
  })

  router.get('/user/lookup/username/:username', c => {
    c.response.body = { message: `Hello ${Object.fromEntries(c.request.url.searchParams).username}` }
  })

  app.use(router.routes)

  const r1 = new Request('http://localhost:3000/user')
  await app.handle(r1)

  const r2 = new Request('http://localhost:3000/user/comments')
  await app.handle(r2)

  const r3 = new Request('http://localhost:3000/user/avatar')
  await app.handle(r3)

  const r4 = new Request('http://localhost:3000/user/lookup/email/benchmark')
  await app.handle(r4)

  const r5 = new Request('http://localhost:3000/status', { method: 'POST' })
  await app.handle(r5)

  const r6 = new Request('http://localhost:3000/how/deep/can/this/even/go/holy/shit/it/goes/even/deeper/omg/ok/now/it/finally/ends')
  await app.handle(r6)

  const r7 = new Request('http://localhost:3000/user/lookup/username/johndoe')
  await app.handle(r7)
})
