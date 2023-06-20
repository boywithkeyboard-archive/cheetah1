[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Environment Variables

> **Note**: This will only work on Cloudflare Workers. If you're not deploying
> your app to Cloudflare Workers, simply use the built-in `Deno.env.get()`
> method instead.

At first, you should define a global `Environment` type. To do that, create a
file named `env.d.ts` with the following content:

```ts
declare global {
  // @ts-ignore
  type Environment = {
    // ...
  }
}

export {}
```

Then include it in your `deno.json` file like so:

```json
{
  "compilerOptions": {
    "types": [
      "./env.d.ts"
    ]
  }
}
```

You probably need to reload VSCode in order for the changes to take effect.
After defining them, you can access them just like that:

```ts
app.get('/example', (c) => {
  console.log(c.env.example_key) // should be a string
})
```
