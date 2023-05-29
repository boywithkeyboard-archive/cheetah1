<div align='center'>
  <img src='https://github.com/azurystudio/cheetah/blob/dev/cat.png?raw=true' width='64px' />
  <h1>cheetah</h1>
</div>

<br />
<br />

> 🙌 If you need help getting started, have ideas for new features or just want to hang out, make sure to join our Discord server [here](https://discord.gg/hrvetU2cJZ).

**cheetah** is ***~30% faster*** than hono, which is supposed to be the fastest JavaScript framework, and ***~70% faster*** than oak, the Express.js of Deno.

[//]: benchmarkstart

| Benchmark | Time (avg) | min ... max | p75 | p99 | p995 | p999 |
| --- | --- | --- | --- | --- | --- | --- |
| **cheetah** | 54.97 µs/run | 43.8 µs ... 1.75 ms | 47.6 µs | 155.8 µs | 461.3 µs | 987.1 µs |
| [hono](https://github.com/honojs/hono) | 66.85 µs/run | 48 µs ... 1.45 ms | 63.9 µs | 264 µs | 720.4 µs | 1.01 ms |
| [itty-router](https://github.com/kwhitley/itty-router) | 62.24 µs/run | 51.6 µs ... 1.41 ms | 58.1 µs | 128.6 µs | 215 µs | 1.17 ms |
| [oak](https://github.com/oakserver/oak) | 84.63 µs/run | 68.7 µs ... 2.53 ms | 76.6 µs | 280.2 µs | 587.8 µs | 775.5 µs |

###### Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.33.3 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.8.0/mod.ts'
import { serve } from 'https://deno.land/std@0.189.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```

> ❔ Read our [Guide](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md) to get started.

### Why cheetah?

- [x] 🪖 `secure` - cheetah ensures that parsing doesn't cause your app to freeze.
- [x] 🧙‍♂️ `schema validation` - out-of-the-box support for schema validation via TypeBox or Zod. [*Show more!*](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/schema_validation.md)
- [x] 💎 `simple` - built-in support for CORS, caching, schema validation, debugging and more! [*Show more!*](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/simple.md)
- [x] 🪹 `chaining & nesting` - cheetah doesn't dictate you how to write your app. [*Show more!*](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/chaining_and_nesting.md)
- [x] 🪶 `light` - all core functionality in **~11 KB**. [*Show more!*](https://github.com/azurystudio/cheetah/blob/dev/guide/reasons/light.md)
