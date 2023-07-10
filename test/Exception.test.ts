import { assertEquals } from './deps.ts'
import cheetah, { Exception } from '../mod.ts'

Deno.test('Exception', async () => {
  const app = new cheetah()

  // Custom
  app.get('/custom1', () => {
    throw new Exception('Custom')
  })
  app.get('/custom2', () => {
    throw new Exception('Custom', 420)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/custom1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 400, message: 'Custom' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/custom2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 420, message: 'Custom' },
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/custom1')))
      .text(),
    'Custom',
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/custom2')))
      .text(),
    'Custom',
  )

  // Not Found
  app.get('/notfound1', () => {
    throw new Exception('Not Found')
  })
  app.get('/notfound2', () => {
    throw new Exception(404)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/notfound1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 404, message: 'Not Found' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/notfound2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 404, message: 'Not Found' },
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/notfound1')))
      .text(),
    'Not Found',
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/notfound2')))
      .text(),
    'Not Found',
  )

  // Access Denied
  app.get('/accessdenied1', () => {
    throw new Exception('Access Denied')
  })
  app.get('/accessdenied2', () => {
    throw new Exception(403)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/accessdenied1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 403, message: 'Access Denied' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/accessdenied2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 403, message: 'Access Denied' },
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/accessdenied1')))
      .text(),
    'Access Denied',
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/accessdenied2')))
      .text(),
    'Access Denied',
  )

  // Something Went Wrong
  app.get('/somethingwentwrong1', () => {
    throw new Exception('Something Went Wrong')
  })
  app.get('/somethingwentwrong2', () => {
    throw new Exception(500)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/somethingwentwrong1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 500, message: 'Something Went Wrong' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/somethingwentwrong2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 500, message: 'Something Went Wrong' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/somethingwentwrong1'),
    )).text(),
    'Something Went Wrong',
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/somethingwentwrong2'),
    )).text(),
    'Something Went Wrong',
  )

  // Bad Request
  app.get('/badrequest1', () => {
    throw new Exception('Bad Request')
  })
  app.get('/badrequest2', () => {
    throw new Exception(400)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/badrequest1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 400, message: 'Bad Request' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/badrequest2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 400, message: 'Bad Request' },
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/badrequest1')))
      .text(),
    'Bad Request',
  )
  assertEquals(
    await (await app.fetch(new Request('http://localhost:3000/badrequest2')))
      .text(),
    'Bad Request',
  )

  // Payload Too Large
  app.get('/payloadtoolarge1', () => {
    throw new Exception('Payload Too Large')
  })
  app.get('/payloadtoolarge2', () => {
    throw new Exception(413)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/payloadtoolarge1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 413, message: 'Payload Too Large' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/payloadtoolarge2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 413, message: 'Payload Too Large' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/payloadtoolarge1'),
    )).text(),
    'Payload Too Large',
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/payloadtoolarge2'),
    )).text(),
    'Payload Too Large',
  )

  // Too Many Requests
  app.get('/toomanyrequests1', () => {
    throw new Exception('Too Many Requests')
  })
  app.get('/toomanyrequests2', () => {
    throw new Exception(429)
  })
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/toomanyrequests1', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 429, message: 'Too Many Requests' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/toomanyrequests2', {
        headers: { accept: 'application/json' },
      }),
    )).json(),
    { code: 429, message: 'Too Many Requests' },
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/toomanyrequests1'),
    )).text(),
    'Too Many Requests',
  )
  assertEquals(
    await (await app.fetch(
      new Request('http://localhost:3000/toomanyrequests2'),
    )).text(),
    'Too Many Requests',
  )
})
