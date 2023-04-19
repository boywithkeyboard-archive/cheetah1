[← readme](https://github.com/azurystudio/cheetah#readme)

## Response

### Set Response Body

- #### Text

  ```ts
  // #1 - Explicit
  app.get('/example', c => {
    c.res.text('text')
  })

  // #2 - Implicit
  app.get('/example', c => {
    return 'text'
  })
  ```

- #### JSON

  ```ts
  // #1 - Explicit
  app.get('/example', c => {
    c.res.json({ key: 'value' })
  })

  // #2 - Implicit
  app.get('/example', c => {
    return { key: 'value' }
  })
  ```

- #### ArrayBuffer/Uint8Array

  ```ts
  app.get('/example', c => {
    c.res.buffer(buffer)
  })
  ```

- #### Blob

  ```ts
  app.get('/example', c => {  
    c.res.blob(blob)
  })
  ```

- #### FormData

  ```ts
  app.get('/example', c => {
    c.res.formData(formData)
  })
  ```

- #### ReadableStream

  ```ts
  app.get('/example', c => {
    c.res.stream(readableStream)
  })
  ```

### Set Response Code

**By default, the status code is 200** - if an error occurs, it will be 500 (unknown error) or 400 (validation error).

- #### Directly

  ```ts
  c.res.code(statusCode)
  ```

- #### Indirectly

  - You can either specify the status code for the response as second argument when setting the response body:

    ```ts
    app.get('/example', c => {
      c.res.buffer(buffer, statusCode)
    })
    ```

  - ...or in the JSON object (if your response body should be a JSON object):
    
    > **Note**: cheetah won't remove the `code` field from your JSON object!

    ```ts
    app.get('/example', c => {
      return {
        code: 200,
        // ...
      }
    })
    ```

### Attach a Header

```ts
c.res.header(name, value)
```

### Attach a Cookie

```ts
c.res.cookie(name, value, options)
```

- *name* `string`
- *value* `string`
- *options* `object`
  - *expiresAt* `Date`
  - *maxAge* `number`
  - *domain* `string`
  - *path* `string`
  - *secure* `boolean`
  - *httpOnly* `boolean`
  - *sameSite* `string`

### Make a Redirect

```ts
c.res.redirect(destination, statusCode)
```

- *destination* `string`
- *statusCode* `string` *(307 - temporary redirect - by default)*
