[← readme](https://github.com/azurystudio/cheetah#readme)

## Environment Variables

cheetah automatically tries to fetch your environment variables, but if you want to set custom variables, please set them when constructing a new app.

> **Warning**: We inherently advise against defining custom variables as this approach is prone to errors.

```ts
const app = new cheetah({
  env: {
    ...
  }
})
```

To stay typesafe, provide a type for these variables:

```ts
type Variables = {
  ...
}

const app = new cheetah<Variables>()
```

You can then access them just like this:

```ts
app.get('/example', c => {
  console.log(c.env)
})
```
