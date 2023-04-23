[← readme](https://github.com/azurystudio/cheetah/blob/dev/guide/overview.md)

## Parsing & Validation

### Configuration

#### TypeBox

```ts
import cheetah from 'https://deno.land/x/cheetah/mod.ts'
import typebox, { Type } from 'https://deno.land/x/cheetah/validator/typebox.ts'

const app = new cheetah({
  validator: typebox
})
```

#### Zod

```ts
import cheetah from 'https://deno.land/x/cheetah/mod.ts'
import zod, { z } from 'https://deno.land/x/cheetah/validator/zod.ts'

const app = new cheetah({
  validator: zod
})
```

### Validating & Parsing Body

#### JSON

```ts
// TypeBox

app.post('/example', {
  body: Type.Object({
    key: Type.String()
  })
}, c => {
  const validatedObject = c.req.body
})

// Zod

app.post('/example', {
  body: z.object({
    key: z.string()
  })
}, c => {
  const validatedObject = c.req.body
})
```

#### Text

```ts
// TypeBox

app.post('/example', {
  body: Type.String({ minLength: 4, maxLength: 16 })
}, c => {
  const validatedString = c.req.body
})

// Zod

app.post('/example', {
  body: z.string().min(4).max(16)
}, c => {
  const validatedString = c.req.body
})
```

### Validating & Parsing Query Parameters

```ts
// TypeBox

app.get('/example', {
  query: Type.Object({
    key: Type.String()
  })
}, c => {
  const validatedObject = c.req.query
})

// Zod

app.get('/example', {
  query: z.object({
    key: z.string()
  }).strict()
}, c => {
  const validatedObject = c.req.query
})
```

### Validating & Parsing Headers

```ts
// TypeBox

app.get('/example', {
  query: Type.Object({
    key: Type.String()
  }, { additionalParameters: true })
}, c => {
  const validatedObject = c.req.query
})

// Zod

app.get('/example', {
  query: z.object({
    key: z.string()
  })
}, c => {
  const validatedObject = c.req.query
})
```

### Validating & Parsing Cookies

```ts
// TypeBox

app.get('/example', {
  cookies: Type.Object({
    key: Type.String()
  })
}, c => {
  const validatedObject = c.req.cookies
})

// Zod

app.get('/example', {
  cookies: z.object({
    key: z.string()
  }).strict()
}, c => {
  const validatedObject = c.req.cookies
})
```
