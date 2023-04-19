[← readme](https://github.com/azurystudio/cheetah#readme)

## Collections

You can split your app into multiple files using **Collections**. Creating a new collection is also quite simple:

```ts
import cheetah, { Collection } from 'https://deno.land/x/cheetah@v0.1.0/mod.ts'

const collection = new Collection()
  .get('/example', () => 'Hello World')

const app = new cheetah()
  .use('/prefix', collection)
```
