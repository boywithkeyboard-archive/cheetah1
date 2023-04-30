<div align='center'>
  <img src='https://github.com/azurystudio/cheetah/blob/dev/cat.png?raw=true' width='64px' />
  <h1>cheetah</h1>
</div>

<br />
<br />

**cheetah** is ***~30% faster*** than hono, which is supposed to be the fastest JavaScript framework, and ***~70% faster*** than oak, the Express.js of Deno.

[//]: benchmarkstart

| Benchmark | Time (avg) | min ... max | p75 | p99 | p995 | p999 |
| --- | --- | --- | --- | --- | --- | --- |
| **cheetah** | 53.91 µs/run | 41.7 µs ... 2.2 ms | 47.1 µs | 161.1 µs | 530.9 µs | 961.3 µs |
| [hono](https://github.com/honojs/hono) | 68.63 µs/run | 49.1 µs ... 1.66 ms | 65.8 µs | 184.2 µs | 772 µs | 1.23 ms |
| [itty-router](https://github.com/kwhitley/itty-router) | 63.39 µs/run | 53.2 µs ... 1.43 ms | 59.7 µs | 105.3 µs | 148.7 µs | 1.13 ms |
| [oak](https://github.com/oakserver/oak) | 87.25 µs/run | 70.7 µs ... 2.85 ms | 79.6 µs | 209.8 µs | 579.8 µs | 807.9 µs |

###### Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.33.1 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.3.5/mod.ts'
import { serve } from 'https://deno.land/std@v0.185.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```

> ❔ Read our [Guide](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md) to get started.

### Why cheetah?

- [x] 🪖 `secure` - cheetah ensures that parsing doesn't cause your app to freeze.
- [x] 🧙‍♂️ `schema validation` - out-of-the-box support for schema validation via TypeBox or Zod. [Show more!](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/schema_validation.md)
- [x] 💎 `simple` - built-in support for CORS, caching, schema validation, debugging and more! [Show more!](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/simple.md)
- [x] 🪹 `chaining & nesting` - cheetah doesn't dictate you how to write your app. [Show more!](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/chaining_and_nesting.md)
- [x] 🪶 `light` - all core functionality in **~14.5 kB**. [Show more!](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/light.md)
