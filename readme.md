<div align='center'>
  <img src='https://raw.githubusercontent.com/azurystudio/cheetah/dev/.github/cheetah.svg' width='128px' />
  <br>
  <br>
  <h1>cheetah</h1>
</div>

<div align='center'>
  <p><code>secure</code> × <code>simple</code> × <code>light</code></p>
</div>

<br>

---

<div align='center'>
  <sup>A big thank you goes to</sup>

  <br>
  <br>
  <br>

  <a href='https://deco.cx'>
    <img src='https://github.com/azurystudio/cheetah/blob/dev/.github/sponsors/deco.svg?raw=true' height='48px' />
    <br>
    <br>
    <a href='https://deco.cx'><sup><b>Build fast stores and increase sales.</b></sup></a>
  </a>
</div>

---

<br>

## Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.13.0/mod.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

Deno.serve(app.fetch)
```

## Release Schedule

We strictly follow [SemVer](https://semver.org) and release updates in two channels:

- ◆ **current**

  The current channel is dedicated to stable releases and is safe for use in production.

- ◇ **canary**

  The canary channel is meant for pre-releases that lack features for a stable release or contain features that are still a prototype. These releases are **not suited for production** and only meant for testing purposes.

## Benchmark

[//]: bstart

| Channel | Avg | Max | p75 | p90 | p95 | p99 |
| --- | --- | --- | --- | --- | --- | --- |
| ◆ [**current**](https://deno.land/x/cheetah@v0.13.0) <sup>v0.13.0</sup> | 29769 | 34458 | 33115 | 33720 | 34076 | 34458 |
| ◇ [**canary**](https://deno.land/x/cheetah@v1.0.0-canary.0)<sup>v1.0.0-canary.0</sup> | 31246 | 35226 | 34351 | 34643 | 34824 | 35226 |

[//]: bend

###### A basic [RPS](https://www.google.com/search?q=requests+per+second) benchmark conducted with [oha](https://github.com/hatoo/oha).

## Contributing

We appreciate your help! 💕

To contribute, please read our [contributing guidelines](https://github.com/azurystudio/cheetah/blob/dev/contributing.md)
first.
