[← readme](https://github.com/azurystudio/cheetah#readme)

## Collections

You can split your app into multiple files using **Collections**. Creating a new collection is also quite simple:

```ts
import cheetah, { Collection } from 'https://deno.land/x/cheetah@v0.2.0/mod.ts'

const collection = new Collection()
  .get('/example', () => 'Hello World')

const app = new cheetah()
  .use('/prefix', collection)
```

If you're using a validator, make sure to define the validator type for the collection as well.

```ts
// typebox
import typebox from 'https://deno.land/x/cheetah@v0.2.0/validator/typebox.ts'

const collection = new Collection<EnvironmentType, typeof typebox>()

// zod
import zod from 'https://deno.land/x/cheetah@v0.2.0/validator/zod.ts'

const collection = new Collection<EnvironmentType, typeof zod>()
```
