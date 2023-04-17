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
| **cheetah** | 46.66 µs/run | 37.2 µs ... 1.43 ms | 40.3 µs | 154.4 µs | 229.7 µs | 946.7 µs | 0% |
| [hono](https://github.com/honojs/hono) | 62.54 µs/run | 48.2 µs ... 2.05 ms | 56.5 µs | 178.9 µs | 278.2 µs | 1.57 ms | ***-34.04%*** |
| [itty-router](https://github.com/kwhitley/itty-router) | 60.79 µs/run | 51.2 µs ... 2.11 ms | 56.1 µs | 165.3 µs | 217.5 µs | 1.44 ms | ***-30.3%*** |
| [oak](https://github.com/oakserver/oak) | 84.15 µs/run | 70.3 µs ... 1.24 ms | 77.1 µs | 256.7 µs | 352 µs | 975.3 µs | ***-80.36%*** |

> Benchmark: [basic.ts](https://github.com/azurystudio/cheetah/blob/dev/benchmark/basic.ts) — Runtime: Deno 1.32.4 (x86_64-pc-windows-msvc) — CPU: AMD Ryzen 9 5900X 12-Core

[//]: benchmarkend

#### What cheetah is perfect for:

- [x] **(JSON) API**
- [x] **Upload/Serve Files**
- [ ] **WebSockets** `soon`

> **Note**: If you need support for a specific feature or we forgot to list a particular use case, please feel free to [open a issue](https://github.com/azurystudio/cheetah/issues/new) regarding it.
