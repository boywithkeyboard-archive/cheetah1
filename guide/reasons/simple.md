[← Why cheetah?](https://github.com/azurystudio/cheetah#why-cheetah)

## CORS

cheetah has built-in support for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). You can configure it according to the [specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) of the `Access-Control-Allow-Origin` header.

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.10.0/mod.ts'

const app = new cheetah({
  cors: '*'
})
```

## Caching

> **Note**: cheetah doesn't support caching for Deno at this time because it isn't yet implemented in Deno Deploy.

cheetah has out-of-the-box support for caching using the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.10.0/mod.ts'

const app = new cheetah({
  cache: {
    name: 'example',
    duration: 600 // 10 minutes
  }
})
```

## Debugging

> **Warning**: Debug Mode shouldn't be used in production.

cheetah prints out all incoming requests and the status code of their corresponding response to the console when you enable debug mode.

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.10.0/mod.ts'

const app = new cheetah({
  debug: true
})
```
