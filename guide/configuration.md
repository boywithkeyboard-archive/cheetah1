[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Configuration

### Base

A prefix for **all** routes, e.g. `/api`.

```ts
new cheetah({
  base: '/api'
})
```

### Caching

> **Note**: cheetah doesn't support caching for Deno at this time because it isn't yet implemented in Deno Deploy.

cheetah has out-of-the-box support for caching using the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

```ts
new cheetah({
  cache: {
    name: 'example',
    duration: 600 // 10 minutes
  }
})
```

### CORS

cheetah has built-in support for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). You can configure it according to the [specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) of the `Access-Control-Allow-Origin` header.

```ts
new cheetah({
  cors: '*'
})
```

### Debugging

> **Warning**: Debug Mode shouldn't be used in production.

This will print out all incoming requests and the status code of their corresponding response to the console.

```ts
new cheetah({
  debug: true
})
```

### Custom Error Handler

If you want, you can specify a custom error handler.

```ts
new cheetah({
  error(error, request) {
    if (error instanceof Error)
      return new Response(error.message)

    return new Response('SOMETHING UNEXPECTED HAPPENED', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  }
})
```

### Custom Not Found Handler

If you want, you can specify a custom not found handler.

```ts
new cheetah({
  notFound(_request) {
    return new Response('NOT FOUND', {
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  }
})
```
