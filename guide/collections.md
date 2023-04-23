[← readme](https://github.com/azurystudio/cheetah/blob/dev/guide/overview.md)

## Collections

You can split your app into multiple files using **Collections**. Creating a new collection is also quite simple:

```ts
import cheetah, { Collection } from 'https://deno.land/x/cheetah/mod.ts'

const collection = new Collection()
  .get('/example', () => 'Hello World')

const app = new cheetah()
  .use('/prefix', collection)
```

If you're using a validator, make sure to define the validator type for the collection as well.

```ts
// typebox
import typebox from 'https://deno.land/x/cheetah/validator/typebox.ts'

const collection = new Collection<typeof typebox>()

// zod
import zod from 'https://deno.land/x/cheetah/validator/zod.ts'

const collection = new Collection<typeof zod>()
```
