<div align="center">
  <img src="https://github.com/azurystudio/cheetah/blob/dev/cat.png?raw=true" width="64px" />
  <h1>cheetah</h1>
</div>

<br />
<br />

> **Warning**: This is the codebase for the upcoming v1.0, the codebase for the current v0 can be found [here](https://github.com/azurystudio/cheetah/tree/v0).

---

<div align="center">
  <sup>A big thank you goes to</sup>

  <br>
  <br>
  <br>

  <a href="https://deco.cx">
    <img src="https://github.com/azurystudio/cheetah/blob/dev/.github/sponsors/deco.svg?raw=true" height="48px" />
    <br>
    <br>
    <a href="https://deco.cx"><sup><b>Build fast stores and increase sales.</b></sup></a>
  </a>
</div>

---

**cheetah** is _**~30% faster**_ than hono, which is supposed to be the fastest
JavaScript framework, and _**~70% faster**_ than oak, the Express.js of Deno.

| Benchmark                                              | Time (avg)   | min ... max         | p75     | p99      | p995     | p999    |
| ------------------------------------------------------ | ------------ | ------------------- | ------- | -------- | -------- | ------- |
| **cheetah**                                            | 61.02 µs/run | 48 µs ... 2.41 ms   | 53.2 µs | 175.6 µs | 522.3 µs | 1.17 ms |
| [hono](https://github.com/honojs/hono)                 | 72.26 µs/run | 50.1 µs ... 2.36 ms | 68.5 µs | 216.5 µs | 810.6 µs | 1.17 ms |
| [itty-router](https://github.com/kwhitley/itty-router) | 70.88 µs/run | 58.2 µs ... 2.27 ms | 64.8 µs | 197.7 µs | 286.2 µs | 1.33 ms |
| [oak](https://github.com/oakserver/oak)                | 96.5 µs/run  | 70.1 µs ... 3.67 ms | 82.2 µs | 521.4 µs | 737.7 µs | 1.16 ms |

[//]: benchmarkend

### Sneak Peek

```ts
import cheetah from "https://deno.land/x/cheetah@v0.13.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const app = new cheetah()
  .get("/", () => "Hello World");

serve(app.fetch);
```

---

**NEW:** Check out our new guide at [cheetah.mod.land](https://cheetah.mod.land)

---

### Why cheetah?

- [x] 🪖 `secure` - cheetah ensures that parsing doesn't cause your app to
      freeze.
- [x] 🧙‍♂️ `schema validation` - out-of-the-box support for schema validation via
      TypeBox or Zod.
- [x] 💎 `simple` - built-in support for CORS, caching, schema validation,
      debugging and more!
- [x] 🪹 `chaining & nesting` - cheetah doesn't dictate you how to write your
      app.
- [x] 🪶 `light` - all core functionality in **~11 KB**.
