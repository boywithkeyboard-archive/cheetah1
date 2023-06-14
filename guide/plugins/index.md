[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## Plugins

> **Warning**: This feature is still in an early stage. It is stable, but may undergo minor syntactical changes before v1 is released.

> **Note**: Currently there are no official plugins, but we are working on some, as you can see [here](https://github.com/azurystudio/cheetah/issues/20).

### Official Plugins

We provide a set of plugins that are guaranteed to work with cheetah.

- [helmet](https://github.com/azurystudio/cheetah/blob/dev/guide/plugins/helmet.md)

### Introduction

If you want to add additional functionality to your application on a global, per collection, or per path level, plugins suit your needs.

Plugins let you create and publish reusable functions for your own and open source purposes.

```ts
import cheetah, { createPlugin } from 'https://deno.land/x/cheetah@v0.11.0/mod.ts'

export const myPlugin = createPlugin<{
  option: string // < settings the user can pass to the plugin
}>(settings => { // < will be a object with the key 'option'
  return {
    beforeParsing(c) { // access context to modify request/response
      ...
    }
  }
})

// You can then use it in your app just like that:

const app = new cheetah()
  .use(myPlugin({
    option: 'example'
  }))
```

Alternatively, you can create one without settings:

```ts
import cheetah, { createPlugin } from 'https://deno.land/x/cheetah@v0.11.0/mod.ts'

export const myPlugin = createPlugin({
  beforeParsing(c) { // access context to modify request/response
    ...
  }
})

// You can then use it in your app just like that:

const app = new cheetah()
  .use(myPlugin)
```

### Attach a Plugin to a Collection

```ts
const app = new cheetah()
  .use('/prefix-for-collection', someCollection, somePlugin, anotherPlugin) // you can add as many plugins as you want
```

### Attach a Plugin by a Prefix

These plugins will fire on every route that starts with `/prefix`.

```ts
const app = new cheetah()
  .use('/prefix', somePlugin, anotherPlugin) // you can add as many plugins as you want
```

### Execution Order

> **Note**: Plugins won't stop the execution. If you want to stop the execution and respond before the actual route handlers, you should throw a error and handle that error in your custom error handler.

1. cache *(built-in)*
2. preflight response *(built-in)*
3. `beforeParsing`
4. validation & advanced parsing *(built-in)*
6. `beforeHandling`
7. route handlers *(the methods you define inside a `.get`, `.post` etc. method)*
8. `beforeResponding`
