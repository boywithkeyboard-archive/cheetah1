[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Deploying

cheetah can run on [Cloudflare Workers](https://workers.cloudflare.com) as well as on [Deno Deploy](https://deno.com/deploy). You can also host it yourself on a VPS with Deno.

### Cloudflare Workers

> **Note**: This example uses the [Module Worker](https://blog.cloudflare.com/workers-javascript-modules) syntax.

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.8.0/mod.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

export default app // or: export default { fetch: app.fetch }
```

#### Building

To compile your application into a single JavaScript file that you can deploy to Cloudflare Workers, run the following command:

```bash
# deno run -A https://deno.land/x/cheetah@v0.8.0/build.ts <input> <output>
deno run -A https://deno.land/x/cheetah@v0.8.0/build.ts mod.ts mod.js
```

### Deno (Deploy)

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.8.0/mod.ts'
import { serve } from 'https://deno.land/std@v0.185.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```
