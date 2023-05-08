[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Syntax

### Suggested

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.6.0/mod.ts'

// #1
const app = new cheetah()
  .get('/a', () => 'Hello World')
  .get('/b', () => ({ message: 'Hello World' }))

// #2
const app = new cheetah()
  .get('/a', c => {
    // some code

    return 'Hello World'
  })

  .get('/b', c => {
    // some code

    return { message: 'Hello World' }
  })
```

### Alternatives

[Express.js](https://github.com/expressjs/express)ish

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.6.0/mod.ts'

const app = new cheetah()

app.get('/a', c => {
  return c.text('Hello World')
})

app.get('/b', c => {
  return c.json({ message: 'Hello World' })
})
```

[Hono](https://github.com/honojs/hono)ish

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.6.0/mod.ts'

const app = new cheetah()
  .get('/a', c => c.text('Hello World'))
  .get('/b', c => c.json({ message: 'Hello World' }))
```
