<div align='center'>
  <img src='https://cheetah.mod.land/cheetah.svg' width='128px' />
  <br>
  <br>
  <h1>cheetah</h1>
</div>

<div align='center'>
  <p><code>🛡️ secure</code> × <code>💎 simple</code> × <code>🪶 light</code></p>
</div>

<br>

> [!WARNING]
> As of October 9th, cheetah was archived and won't receive any updates.

<br>

### Sneak Peek 👾

```ts
import cheetah from 'https://deno.land/x/cheetah/mod.ts'
import { z } from 'https://deno.land/x/zod/mod.ts'

const app = new cheetah()
  .post('/', {
    body: z.object({ // < scheme validation
      name: z.string()
    })
  }, async c => {
    const body = await c.req.body()

    return `Hey, ${body.name}!` // < response body
  })

app.serve() // < launch app
```

❔ Please read our [guide](https://cheetah.mod.land) or [join our Discord](https://discord.gg/2rCya9EWGv) to learn more.

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

### Release Schedule 🗓️

We strictly adhere to [SemVer](https://semver.org) and post updates **weekly**.

- ◆ **current** *(e.g. v0.1.0)*

  The current channel is dedicated to stable releases and is safe for use in production.

- ◇ **canary** *(e.g. v0.1.0-canary.0)*

  The canary channel is meant for pre-releases that lack features for a stable release or contain features that are still a prototype. These releases are **not suited for production** and only meant for testing purposes.

<br>

### Contributing 😘

We appreciate your help! 💕

To contribute, please read our [contributing guidelines](https://github.com/azurystudio/cheetah/blob/dev/contributing.md)
first.
