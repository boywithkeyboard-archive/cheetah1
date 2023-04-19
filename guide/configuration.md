[← readme](https://github.com/azurystudio/cheetah#readme)

## Configuration

```ts
new cheetah(options)
```

- *base* `string` - A prefix for all routes, e.g. `/api`.
- *cache* `object` *(works only on Cloudflare Workers!)*
  - *name* `string` - A unique name for your cache.
  - *duration* `number` - Duration in seconds for how long a cached response should be held in memory.
- *cors* `string` - Enable Cross-Origin Resource Sharing (CORS) for your app by setting a origin, e.g. `*`.
- *debug* `boolean` - Enable **Debug Mode**. As a result, every fetch and error event will be logged.
- *error* `Function` - Set a custom error handler.
- *notFound* `Function` - Set a custom 404 handler.
