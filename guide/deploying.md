[← readme](https://github.com/azurystudio/cheetah/blob/dev/guide/overview.md)

## Deploying

### Cloudflare Workers

```ts
import cheetah from 'https://deno.land/x/cheetah/mod.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

export default app // or: export default { fetch: app.fetch }
```

#### Building

```bash
# deno run -A https://deno.land/x/cheetah/build.ts <input> <output>
deno run -A https://deno.land/x/cheetah/build.ts mod.ts mod.js
```

### Deno Deploy

```ts
import cheetah from 'https://deno.land/x/cheetah/mod.ts'
import { serve } from 'https://deno.land/std@v0.184.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```
