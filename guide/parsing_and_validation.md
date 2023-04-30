[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Parsing & Validation

### TypeBox

- #### Setup

    ```ts
    import cheetah from 'https://deno.land/x/cheetah/mod.ts'
    import typebox, { Type } from 'https://deno.land/x/cheetah@v0.3.5/validator/typebox.ts'

    const app = new cheetah({
      validator: typebox
    })
    ```

- #### Parsing & Validating Body

  JSON:

    ```ts
    app.post('/example', {
      body: Type.Object({
        key: Type.String()
      })
    }, c => {
      const validatedObject = c.req.body
    })
    ```

  Text:

    ```ts
    app.post('/example', {
      body: Type.String({ minLength: 4, maxLength: 16 })
    }, c => {
      const validatedString = c.req.body
    })
    ```

- #### Parsing & Validating Query Parameters

    ```ts
    app.get('/example', {
      query: Type.Object({
        key: Type.String()
      })
    }, c => {
      const validatedObject = c.req.query
    })
    ```

- #### Parsing & Validating Headers

    ```ts
    app.get('/example', {
      query: Type.Object({
        key: Type.String()
      }, { additionalParameters: true })
    }, c => {
      const validatedObject = c.req.query
    })
    ```

- #### Parsing & Validating Cookies

    ```ts
    app.get('/example', {
      cookies: Type.Object({
        key: Type.String()
      })
    }, c => {
      const validatedObject = c.req.cookies
    })
    ```

### Zod

- #### Setup

    ```ts
    import cheetah from 'https://deno.land/x/cheetah@v0.3.5/mod.ts'
    import zod, { z } from 'https://deno.land/x/cheetah@v0.3.5/validator/zod.ts'

    const app = new cheetah({
      validator: zod
    })
    ```

- #### Parsing & Validating Body

  JSON:

    ```ts
    app.post('/example', {
      body: z.object({
        key: z.string()
      })
    }, c => {
      const validatedObject = c.req.body
    })
    ```

  Text:

    ```ts
    app.post('/example', {
      body: z.string().min(4).max(16)
    }, c => {
      const validatedString = c.req.body
    })
    ```

- #### Parsing & Validating Query Parameters

    ```ts
    app.get('/example', {
      query: z.object({
        key: z.string()
      }).strict()
    }, c => {
      const validatedObject = c.req.query
    })
    ```

- #### Parsing & Validating Headers

    ```ts
    app.get('/example', {
      query: z.object({
        key: z.string()
      })
    }, c => {
      const validatedObject = c.req.query
    })
    ```

- #### Parsing & Validating Cookies

    ```ts
    app.get('/example', {
      cookies: z.object({
        key: z.string()
      }).strict()
    }, c => {
      const validatedObject = c.req.cookies
    })
    ```
