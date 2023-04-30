[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Request

### Get IP Address

```ts
app.get('/example', c => {
  console.log(c.req.ip) // e.g. '127.0.0.1'
})
```

### Get Raw Request

```ts
app.get('/example', c => {
  const rawRequest = c.req.raw() // unmodified request object
})
```

### Get Request Parameters

```ts
app.get('/example/:some_param', c => {
  const paramValue = c.req.param('some_param')
})
```

### Read Request Body

> **Note**: If you have a request body of type `application/json` or `plain/text`, we recommend to follow the [Parsing & Validation](https://github.com/azurystudio/cheetah/blob/dev/guide/parsing_and_validation.md) guide.

These methods all have a default time limit of *3000 ms* for added security. If the function cannot complete within *3000 ms* or fails to parse the body, it will return `null`.

You can always use one of these methods, even if you've already read the body before - they won't throw an error!

- #### Buffer

  ```ts
  app.get('/example', async c => {
    const bufferOrNull = await c.req.buffer() // for a custom time limit: c.req.buffer(yourNumberOfMilliseconds)

    if (!bufferOrNull)
      console.log(`couldn't finish within 3s`)
  })
  ```

- #### Blob

  ```ts
  app.get('/example', async c => {
    const blobOrNull = await c.req.blob()
  })
  ```

- #### FormData

  ```ts
  app.get('/example', async c => {
    const formDataOrNull = await c.req.formData()
  })
  ```

- #### ReadableStream

  ```ts
  app.get('/example', c => {
    const streamOrNull = c.req.stream()
  })
  ```

### Retrieve Geo-Location Data

> **Note**: This only works on Cloudflare Workers.

```ts
app.get('/example', c => {
  const geoData = c.req.geo()
})
```

**Consisting of:**

- *city* `string`
- *region* `string`
- *country* `string`
- *continent* `string`
- *regionCode* `string`
- *latitude* `string`
- *longitude* `string`
- *postalCode* `string`
- *timezone* `string`
- *datacenter* `string`
