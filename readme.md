<div align='center'>
  <img src='https://github.com/azurystudio/cheetah/blob/dev/cat.png?raw=true' width='64px' />
  <h1>cheetah</h1>
</div>

<br />
<br />

**cheetah** is ***~30% faster*** than hono, which is supposed to be the fastest JavaScript framework, and ***~70% faster*** than oak, the Express.js of Deno.

[//]: benchmarkstart

| Benchmark | Time (avg) | min ... max | p75 | p99 | p995 | p999 | Diff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **cheetah** | 49.61 µs/run | 39.3 µs ... 1.81 ms | 43.1 µs | 167.2 µs | 332.4 µs | 922.1 µs | ... |
| [hono](https://github.com/honojs/hono) | 63.79 µs/run | 48.3 µs ... 1.92 ms | 58.9 µs | 178.5 µs | 255.8 µs | 1.63 ms | **-28.57%** |
| [itty-router](https://github.com/kwhitley/itty-router) | 63.22 µs/run | 51.7 µs ... 1.71 ms | 58.4 µs | 163 µs | 209.3 µs | 1.46 ms | **-27.44%** |
| [oak](https://github.com/oakserver/oak) | 85.44 µs/run | 70.5 µs ... 1.29 ms | 77.8 µs | 222.1 µs | 326.4 µs | 1.05 ms | **-72.22%** |

> Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.32.4 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@v0.184.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch.bind(app))
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
