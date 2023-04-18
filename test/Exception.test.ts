import { assertEquals } from 'https://deno.land/std@v0.184.0/testing/asserts.ts'
import cheetah, { Exception } from '../mod.ts'

Deno.test('Exception', async () => {
  const app = new cheetah()

  // Not Found
  app.get('/notfound1', () => {
    throw new Exception('Not Found')
  })
  app.get('/notfound2', () => {
    throw new Exception(404)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/notfound1'))).json(), { code: 404, message: 'Not Found' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/notfound2'))).json(), { code: 404, message: 'Not Found' })

  // Access Denied
  app.get('/accessdenied1', () => {
    throw new Exception('Access Denied')
  })
  app.get('/accessdenied2', () => {
    throw new Exception(403)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/accessdenied1'))).json(), { code: 403, message: 'Access Denied' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/accessdenied2'))).json(), { code: 403, message: 'Access Denied' })

  // Something Went Wrong
  app.get('/somethingwentwrong1', () => {
    throw new Exception('Something Went Wrong')
  })
  app.get('/somethingwentwrong2', () => {
    throw new Exception(500)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/somethingwentwrong1'))).json(), { code: 500, message: 'Something Went Wrong' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/somethingwentwrong2'))).json(), { code: 500, message: 'Something Went Wrong' })

  // Bad Request
  app.get('/badrequest1', () => {
    throw new Exception('Bad Request')
  })
  app.get('/badrequest2', () => {
    throw new Exception(400)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/badrequest1'))).json(), { code: 400, message: 'Bad Request' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/badrequest2'))).json(), { code: 400, message: 'Bad Request' })

  // Payload Too Large
  app.get('/payloadtoolarge1', () => {
    throw new Exception('Payload Too Large')
  })
  app.get('/payloadtoolarge2', () => {
    throw new Exception(413)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/payloadtoolarge1'))).json(), { code: 413, message: 'Payload Too Large' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/payloadtoolarge2'))).json(), { code: 413, message: 'Payload Too Large' })

  // Too Many Requests
  app.get('/toomanyrequests1', () => {
    throw new Exception('Too Many Requests')
  })
  app.get('/toomanyrequests2', () => {
    throw new Exception(429)
  })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/toomanyrequests1'))).json(), { code: 429, message: 'Too Many Requests' })
  assertEquals(await (await app.fetch(new Request('http://localhost:3000/toomanyrequests2'))).json(), { code: 429, message: 'Too Many Requests' })
})
