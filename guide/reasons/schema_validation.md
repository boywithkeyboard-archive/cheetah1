[← Why cheetah?](https://github.com/azurystudio/cheetah#why-cheetah)

## 🧙‍♂️ Schema Validation

When building a large API with cheetah, you probably want some sort of
validation to reduce the amount of boilerplate code to validate the body, query,
cookies, and header of the incoming request.

With cheetah, this is fairly straightforward. The following example uses
[Zod](https://github.com/colinhacks/zod) as the validator and verifies that the
body of the incoming request is of the type string and has the format of an
emoji.

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.11.0/mod.ts'
import zod, { z } from 'https://deno.land/x/cheetah@v0.11.0/validator/zod.ts'

const app = new cheetah({
  validator: zod,
})

app.post('/emoji', {
  body: z.string().emoji(),
}, () => `it's an emoji!`)
```
