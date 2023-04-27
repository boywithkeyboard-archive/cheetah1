[← readme](https://github.com/azurystudio/cheetah/blob/dev/guide/overview.md)

## Environment Variables

At first, you should define a global `Environment` type. To do that, create a file named `env.d.ts` with the following content:

```ts
declare global {
  // @ts-ignore
  type Environment = {
    // ...
  }
}

export {}
```

Then include it in your `deno.json` file like that:

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

After defining them, you can access them like that:

```ts
app.get('/example', c => {
  console.log(c.env.example_key) // should be a string
})
```
