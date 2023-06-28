<div align='center'>
  <img src='https://raw.githubusercontent.com/azurystudio/cheetah/dev/.github/cat.png' width='64px' />
  <h1>cheetah</h1>
</div>

<div align='center'>
  <p>🪖 <code>secure</code> × 💎 <code>simple</code> × 🪹 <code>nestable</code> × 🪶 <code>light</code></p>
</div>

<br />

### Sneak Peek

```ts
import cheetah from 'https://deno.land/x/cheetah@v0.13.0/mod.ts'
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

const app = new cheetah()
  .get('/', () => 'Hello World')

serve(app.fetch)
```

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

### Contributing

We appreciate your help! 💕

To contribute, please read our [contributing guidelines](https://github.com/azurystudio/cheetah/blob/dev/contributing.md)
first.
