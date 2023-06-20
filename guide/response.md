[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Response

### Set Response Body

- #### Text

  ```ts
  // #1 - Explicit
  app.get('/example', (c) => {
    c.res.text('text')
  })

  // #2 - Implicit
  app.get('/example', (c) => {
    return 'text'
  })
  ```

- #### JSON

  ```ts
  // #1 - Explicit
  app.get('/example', (c) => {
    c.res.json({ key: 'value' })
  })

  // #2 - Implicit
  app.get('/example', (c) => {
    return { key: 'value' }
  })
  ```

- #### ArrayBuffer/Uint8Array

  ```ts
  app.get('/example', (c) => {
    c.res.buffer(buffer)
  })
  ```

- #### Blob

  ```ts
  app.get('/example', (c) => {
    c.res.blob(blob)
  })
  ```

- #### FormData

  ```ts
  app.get('/example', (c) => {
    c.res.formData(formData)
  })
  ```

- #### ReadableStream

  ```ts
  app.get('/example', (c) => {
    c.res.stream(readableStream)
  })
  ```

### Set Response Code

**By default, the status code is 200** - if an error occurs, it will be 500
(unknown error) or 400 (validation error).

- #### Directly

  ```ts
  c.res.code(statusCode)
  ```

- #### Indirectly

  - You can either specify the status code for the response as second argument
    when setting the response body:

    ```ts
    app.get('/example', (c) => {
      c.res.buffer(buffer, statusCode)
    })
    ```

  - ...or in the JSON object (if your response body should be a JSON object):

    > **Note**: cheetah won't remove the `code` field from your JSON object!

    ```ts
    app.get('/example', (c) => {
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

- _name_ `string`
- _value_ `string`
- _options_ `object`
  - _expiresAt_ `Date`
  - _maxAge_ `number`
  - _domain_ `string`
  - _path_ `string`
  - _secure_ `boolean`
  - _httpOnly_ `boolean`
  - _sameSite_ `string`

### Make a Redirect

```ts
c.res.redirect(destination, statusCode)
```

- _destination_ `string`
- _statusCode_ `string` _(307 - temporary redirect - by default)_
