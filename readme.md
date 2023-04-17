<div align='center'>
  <img src='https://github.com/azurystudio/cheetah/blob/dev/cat.png?raw=true' width='64px' />
  <h1>cheetah</h1>
</div>

<br />
<br />

**cheetah** is ***~30% faster*** than hono, which is supposed to be the fastest JavaScript framework, and ***around 80% faster*** than oak, the Express.js of Deno.

[//]: benchmarkstart

| Benchmark | Time (avg) | min ... max | p75 | p99 | p995 | p999 | Diff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **cheetah** | 46.37 µs/run | 37.3 µs ... 1.56 ms | 40.4 µs | 130.9 µs | 221.3 µs | 974.4 µs | ... |
| [hono](https://github.com/honojs/hono) | 62.32 µs/run | 47.2 µs ... 2.1 ms | 56.4 µs | 146.7 µs | 261 µs | 1.63 ms | ***-34.4%*** |
| [itty-router](https://github.com/kwhitley/itty-router) | 59.88 µs/run | 51.9 µs ... 2.47 ms | 55.9 µs | 105.9 µs | 132 µs | 1.48 ms | ***-29.13%*** |
| [oak](https://github.com/oakserver/oak) | 85.74 µs/run | 71.2 µs ... 1.47 ms | 76 µs | 237.3 µs | 343.3 µs | 1.22 ms | ***-84.91%*** |

> Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.32.4 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

#### What cheetah is perfect for:

- [x] **(JSON) API**
- [x] **Upload/Serve Files**
- [ ] **WebSockets** `soon`

> **Note**: If you need support for a specific feature or we forgot to list a particular use case, please feel free to [open a issue](https://github.com/azurystudio/cheetah/issues/new) regarding it.
