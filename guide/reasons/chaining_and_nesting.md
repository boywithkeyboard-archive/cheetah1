[← Why cheetah?](https://github.com/azurystudio/cheetah#readme)

## 🔗 Chaining

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.4.0/mod.ts'

const app = new cheetah()
  .get('/cake', () => '🎂') // GET '/cake'

  .patch('/cookie', () => '🍪') // GET '/cookie'

  .put('/donut', () => '🍩') // GET '/donut'
```

## 🪹 Nesting

```ts
import cheetah, { Collection } from 'https://deno.land/x/cheetah@v0.4.0/mod.ts'

const fastFood = new Collection()
  .get('/burger', () => '🍔') // GET '/fast-food/burger'

const app = new cheetah()
  .use('/fast-food', fastFood)

  .get('/pancakes', () => '🥞') // GET '/pancakes'
```
