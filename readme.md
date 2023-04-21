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
| **cheetah** | 47.64 µs/run | 40 µs ... 1.62 ms | 42.9 µs | 144.7 µs | 185.8 µs | 899.3 µs |
| [hono](https://github.com/honojs/hono) | 59.38 µs/run | 46.8 µs ... 1.73 ms | 54.6 µs | 128.9 µs | 209.8 µs | 1.31 ms |
| [itty-router](https://github.com/kwhitley/itty-router) | 59.61 µs/run | 52.3 µs ... 1.85 ms | 56.4 µs | 91.5 µs | 106.3 µs | 1.37 ms |
| [oak](https://github.com/oakserver/oak) | 79.59 µs/run | 70.6 µs ... 1.09 ms | 74.4 µs | 181.4 µs | 254.4 µs | 850.4 µs |

> Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.32.5 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.2.1/mod.ts'
import { serve } from 'https://deno.land/std@v0.184.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```

### Guide

- ##### General
  - [**Syntax**](https://github.com/azurystudio/cheetah/blob/dev/guide/syntax.md)
  - [**Configuration**](https://github.com/azurystudio/cheetah/blob/dev/guide/configuration.md)
  - [**Collections**](https://github.com/azurystudio/cheetah/blob/dev/guide/collections.md)
  - [**Parsing & Validation**](https://github.com/azurystudio/cheetah/blob/dev/guide/parsing_and_validation.md)
  - [**Deploying**](https://github.com/azurystudio/cheetah/blob/dev/guide/deploying.md)
- ##### Context
  - [**Request**](https://github.com/azurystudio/cheetah/blob/dev/guide/request.md)
  - [**Environment Variables**](https://github.com/azurystudio/cheetah/blob/dev/guide/environment_variables.md)
  - [**Response**](https://github.com/azurystudio/cheetah/blob/dev/guide/response.md)
- ##### Examples
  - [**Cloudflare Workers**](https://github.com/azurystudio/cheetah/blob/dev/guide/request.md)
  - [**Deno (Deploy)**](https://github.com/azurystudio/cheetah/blob/dev/guide/request.md)
