const module = await import(Deno.args[0])
const app = new module.default().get('/', () => 'Hello World')

Deno.serve({ port: 8000 }, app.fetch)
