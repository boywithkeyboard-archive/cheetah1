[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Nesting

You can split your app into multiple files using **collections**. Creating a new collection is also quite simple:

```ts
import cheetah, { Collection } from 'https://deno.land/x/cheetah@v0.10.0/mod.ts'

const collection = new Collection()
  .get('/example', () => 'Hello World')

const app = new cheetah()
  .use('/prefix', collection)
```
