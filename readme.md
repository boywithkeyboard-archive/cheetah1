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
| **cheetah** | 61.02 µs/run | 48 µs ... 2.41 ms | 53.2 µs | 175.6 µs | 522.3 µs | 1.17 ms |
| [hono](https://github.com/honojs/hono) | 72.26 µs/run | 50.1 µs ... 2.36 ms | 68.5 µs | 216.5 µs | 810.6 µs | 1.17 ms |
| [itty-router](https://github.com/kwhitley/itty-router) | 70.88 µs/run | 58.2 µs ... 2.27 ms | 64.8 µs | 197.7 µs | 286.2 µs | 1.33 ms |
| [oak](https://github.com/oakserver/oak) | 96.5 µs/run | 70.1 µs ... 3.67 ms | 82.2 µs | 521.4 µs | 737.7 µs | 1.16 ms |

###### Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.34.0 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.9.0/mod.ts'
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
