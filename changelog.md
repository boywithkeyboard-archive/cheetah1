## Upcoming

- **New Features**

  - Routes do now have a `transform` option. [#4](https://github.com/azurystudio/cheetah/issues/4)

  - Plugins can now extend the context.

- **Revisions**

  - cheetah v0.4.? no longer uses [Medley](https://github.com/medleyjs/router) for routing.

    Tens of hours have been invested to further optimize cheetah's performance. Part of this update is a built-in, better router. Medley is *really* fast, but cheetah needed a typesafe alternative to it.

    The new router was written from scratch and outperforms the old one in most scenarios.

## [v0.4.1](https://github.com/azurystudio/cheetah/releases/tag/v0.4.1)

- **New Features**

  - The [helmet plugin](https://github.com/azurystudio/cheetah/blob/dev/guide/plugins/helmet.md) is now available.

    ```ts
    import cheetah from 'https://deno.land/x/cheetah@v0.4.1/mod.ts'
    import helmet from 'https://deno.land/x/cheetah@v0.4.1/plugins/helmet.ts'

    const app = new cheetah()
      .use(helmet())
    ```

    The plugin is based on [express.js' helmet](https://github.com/helmetjs/helmet).

## [v0.4.0](https://github.com/azurystudio/cheetah/releases/tag/v0.4.0)

- **New Features**

  - cheetah has now support for [plugins](https://github.com/azurystudio/cheetah/blob/dev/guide/plugins/index.md).

    Create, share & publish your own plugins or use one of the official plugins *(coming [soon](https://github.com/azurystudio/cheetah/issues/20)!)*.

## [v0.3.5](https://github.com/azurystudio/cheetah/releases/tag/v0.3.5)

- **New Features**

  - There's now a [template for Deno and Cloudflare Workers](https://github.com/azurystudio/cheetah/blob/dev/guide/get_started.md) available, which you can use by running `deno run --allow-read=. --allow-write=. --allow-net https://deno.land/x/cheetah@v0.3.5/new.ts --template <template>`.

- **Revisions**

  - The whole guide was rewritten and restructured to make it easier to get started with cheetah.

## [v0.3.4](https://github.com/azurystudio/cheetah/releases/tag/v0.3.4)

- **Bug Fixes**

  - Fixed a bug that caused an [illegal invocation](https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome) on Cloudflare Workers.

## [v0.3.3](https://github.com/azurystudio/cheetah/releases/tag/v0.3.3)

- **Bug Fixes**

  - The parser ignored simple strings and should add them to the object instead. This issue is now solved.

- **Revisions**

  - Allow `/` as prefix for collections.

    This allows you to split your routing logic into multiple files without having to add a prefix to each collection.

## [v0.3.2](https://github.com/azurystudio/cheetah/releases/tag/v0.3.2)

- **Bug Fixes**

  - Fixed just a tiny issue with the global `Environment` type.

## [v0.3.1](https://github.com/azurystudio/cheetah/releases/tag/v0.3.1)

- **New Features**

  - Introducing the `x` namespace.

    This namespace is meant for auxiliary features that are useful for designing an API, but largely depend on third-party code or don't really fit into the core.

    *Documentation will follow soon!*

## [v0.3.0](https://github.com/azurystudio/cheetah/releases/tag/v0.3.0)

- #### Breaking Changes

  - `c.env` is now (again) a object.

    ***If you're deploying your app to Deno Deploy or self-hosting it, you should use `Deno.env.get()` instead.***

    ```ts
    app.get('/', c => {
      const value = c.env.name
    })
    ```

- **Revisions**

  - `c.req.geo` received a fallback for Deno.

    If you use Cloudflare as a proxy, but for whatever reason self-host your application instead of deploying it to Cloudflare Workers, cheetah will automatically parse the [visitor location headers](https://developers.cloudflare.com/rules/transform/managed-transforms/reference) of the incoming request.

  - `c.waitUntil` now fulfills the promise after the shortest possible delay on Deno. *(This doesn't affect Cloudflare Workers!)*

## [v0.2.3](https://github.com/azurystudio/cheetah/releases/tag/v0.2.3)

- **New Features**

  - We've ported cheetah to NPM.

    ***We strongly recommend using Deno.***

    ```bash
    npm i @azury/cheetah
    ```

    ```ts
    import cheetah from '@azury/cheetah'

    const app = new cheetah()
      .get('/', () => 'Hello World')

    export default app
    ```

## [v0.2.2](https://github.com/azurystudio/cheetah/releases/tag/v0.2.2)

- **Bug Fixes**

  - Fixed a bug that lead to type `unknown` when defining a schema for validation.

- **Revisions**

  - `cheetah` and `Collection` classes no longer take the environment type as first argument. This type should now be defined globally.

## [v0.2.1](https://github.com/azurystudio/cheetah/releases/tag/v0.2.1)

- **Bug Fixes**

  - Fixed a small type issue regarding the environment variables type.

## [v0.2.0](https://github.com/azurystudio/cheetah/releases/tag/v0.2.0)

- #### Breaking Changes

  - `c.env` is now a function. This drastically decreases the overhead and improves the interoperability between Cloudflare Workers and Deno.

    ```ts
    app.get('/', c => {
      const value = c.env('name')
    })
    ```

- **New Features**

  - You can now get the **runtime** on which your code is running with the new `c.runtime` variable.

    The value of this variable will either be `deno` or `cloudflare` depending on where you deployed your app to.

- **Revisions**

  - Removed the validator types.

    ```ts
    // before
    import typebox, { TypeBoxValidator } from 'https://deno.land/x/cheetah@v0.1.1/validator/typebox.ts'

    const app = new cheetah<Environment, TypeBoxValidator>({
      validator: typebox
    })

    const collection = new Collection<Environment, TypeBoxValidator>({
      validator: typebox
    })

    // now
    import typebox from 'https://deno.land/x/cheetah@v0.2.0/validator/typebox.ts'

    const app = new cheetah<Environment, typeof typebox>({
      validator: typebox
    })

    const collection = new Collection<Environment, typeof typebox>({
      validator: typebox
    })
    ```

## [v0.1.1](https://github.com/azurystudio/cheetah/releases/tag/v0.1.1)

- **Bug Fixes**

  - The `build.ts` script now uses [deno bundle](https://deno.land/manual@v1.32.5/tools/bundler) and [esbuild](https://github.com/evanw/esbuild) under the hood.

    The original script used [esbuild_deno_loader](https://github.com/lucacasonato/esbuild_deno_loader), which is probably a better solution for the future - especially since *deno bundle* is scheduled to be removed in the near future - but for now it isn't yet a full-fledged replacement for the command.

## [v0.1.0](https://github.com/azurystudio/cheetah/releases/tag/v0.1.0)

*Published cheetah.*
