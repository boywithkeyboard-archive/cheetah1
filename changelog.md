## [v0.11.0](https://github.com/azurystudio/cheetah/releases/tag/v0.11.0)

- **Bug Fixes**

  - Decode query parameters.

- **New Features**

  - **Preflight Mode.**

    If enabled, cheetah will attempt to find the matching `.get()` handler for an incoming HEAD request. Your existing `.head()` handlers won't be impacted.

    ```ts
    new cheetah({
      preflight: true
    })
    ```

  - You can now configure the `cache` or `cors` option for an entire collection of routes.

    ```ts
    new Collection({
      cache: false,
      cors: '*'
    })
    ```

    *These won't overwrite the options set for individual routes.*

- **Revisions**

  - The `cache.duration` option has been deprecated. Please use the `cache.maxAge` option instead.

## [v0.10.0](https://github.com/azurystudio/cheetah/releases/tag/v0.10.0)

- **New Features**

  - You can now either import the build script as a module or use it from the command line.

    ```bash
    deno run -A https://deno.land/x/cheetah@v0.10.0/build.ts mod.ts --target es2022 mod.js
    ```

    ```ts
    import { build } from 'https://deno.land/x/cheetah@v0.10.0/build.ts'

    build({
      input: './mod.ts',
      output: './mod.js',
      target: 'es2022'
    })
    ```

- **Revisions**

  - You can now pass custom error messages and codes to the `Exception` class.

    ```ts
    app.get('/', () => {
      throw new Exception('No Weed', 420)
    })
    ```

  - The value of the `cache-control` header will be `max-age=0, private, must-revalidate` if you've set the global `duration` or local `maxAge` option to `0`.

## [v0.9.0](https://github.com/azurystudio/cheetah/releases/tag/v0.9.0)

- **New Features**

  - You can now configure/overwrite the cache option per-route. This gives you much more flexibility, especially if you have a bunch of protected routes.

    ```ts
    import cheetah from 'https://deno.land/x/cheetah@v0.9.0/mod.ts'

    const app = new cheetah({
      cache: {
        name: 'example'
        maxAge: 600 // 10 minutes
      }
    })

    // disable cache:

    app.get('/me', {
      cache: false
    }, c => {
      // ...
    })

    // adjust max age:

    app.get('/statistics', {
      cache: { maxAge: 3600 } // 1 hour
    }, c => {
      // ...
    })
    ```

- **Bug Fixes**

  - The `cache` option attached a invalid `cache-control` header to the response. This should now be fixed.

## [v0.8.0](https://github.com/azurystudio/cheetah/releases/tag/v0.8.0)

- **New Features**

  - The `cors` option can now be overwritten for each individual route.

    ```ts
    app.get('/example', { cors: 'example.com' }, () => 'Hello World')
    ```

- **Revisions**

  - Moved the templates to separate repositories. You can now find them [here](https://github.com/search?q=cheetah+topic%3Acheetah+topic%3Atemplate&type=repositories).

  - Plugins should now perform better due to some internal non-breaking changes.

## [v0.7.2](https://github.com/azurystudio/cheetah/releases/tag/v0.7.2)

- **Bug Fixes**

  - Fixed a bug that led to duplicate `content-type` headers. (https://github.com/azurystudio/cheetah/issues/31 by @not-ivy)

    If you weren't specifying your custom headers in lowercase, you ended up with multiple `content-type` headers in your response.

## [v0.7.1](https://github.com/azurystudio/cheetah/releases/tag/v0.7.1)

- **Revisions**

  - `Context` and `Validator` types get now re-exported in the main file.
  - Removed the `credits` file.

## [v0.7.0](https://github.com/azurystudio/cheetah/releases/tag/v0.7.0)

- **New Features**

  - The `schema.body` variable now accepts a `z.record` or `Type.Record` type, which allows you to accept a pair of strings as headers and do no further validation.

    ```ts
    import cheetah from 'https://deno.land/x/cheetah@v0.7.0/mod.ts'
    import validator, { z } from 'https://deno.land/x/cheetah@v0.7.0/validator/zod.ts'

    const app = new cheetah({ validator })

    app.get('/', {
      headers: z.record(z.string(), z.string())
    }, c => {
      const headers = c.req.headers // Record<string, string>
    })
    ```

- **Revisions**

  - cheetah v0.7.0 no longer uses [Medley](https://github.com/medleyjs/router) for routing.

    The new router was written from scratch and is slightly faster in a req/s scenario. **If you value performance, skip this update and wait for v0.8.0** as this will make your application slightly slower (up to -20%).

    This internal change reduces the size of the cheetah's core to barely 10.68 KB!

## [v0.6.1](https://github.com/azurystudio/cheetah/releases/tag/v0.6.1)

- **Revisions**

  - Allow additional properties for the `Context` type.

## [v0.6.0](https://github.com/azurystudio/cheetah/releases/tag/v0.6.0)

- **Revisions**

  - The build script now automatically identifies the configuration file or import map and uses it for bundling. This allows you to use an inline import map or a import map file.

  - The `Exception` class now has a better JSDoc description.

## [v0.5.0](https://github.com/azurystudio/cheetah/releases/tag/v0.5.0)

- **New Features**

  - Routes now have a `transform` option (as mentioned in [#4](https://github.com/azurystudio/cheetah/issues/4)).

    ```ts
    import cheetah from 'https://deno.land/x/cheetah@v0.5.0/mod.ts'
    import zod, { z } from 'https://deno.land/x/cheetah@v0.5.0/validator/zod.ts'

    const app = new cheetah({
      validator: zod
    })
    
    app.get('/example', {
      body: z.object({
        message: z.string()
      }),

      transform: true
    }, async c => {
      console.log(body) // e.g. { message: 'Hello!' }
    })
    ```

    This enables the conversion of a FormData request body into a JSON object *(if the request body has the MIME type `multipart/form-data`)*.

- **Revisions**

  - The `Exception` class now constructs a response based on the `Accept` header.

    If the header contains the MIME type `application/json` or `*/*` (any MIME type), the response body will be a JSON object, otherwise it'll be plain text. This behavior also applies to the default ***error*** and ***not found*** responses.

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
