## [v0.2.1](https://github.com/azurystudio/cheetah/releases/tag/v0.2.1)

- #### Bug Fixes

  - Fixed a small type issue regarding the environment variables type.

## [v0.2.0](https://github.com/azurystudio/cheetah/releases/tag/v0.2.0)

- #### Breaking Changes

  - `c.env` is now a function. This drastically decreases the overhead and improves the interoperability between Cloudflare Workers and Deno.

    ```ts
    app.get('/', c => {
      const value = c.env('name')
    })
    ```

- #### New Features

  - You can now get the **runtime** on which your code is running with the new `c.runtime` variable.

    The value of this variable will either be `deno` or `cloudflare` depending on where you deployed your app to.

- #### Revisions

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

- #### Bug Fixes

  - The `build.ts` script now uses [deno bundle](https://deno.land/manual@v1.32.5/tools/bundler) and [esbuild](https://github.com/evanw/esbuild) under the hood.

    The original script used [esbuild_deno_loader](https://github.com/lucacasonato/esbuild_deno_loader), which is probably a better solution for the future - especially since *deno bundle* is scheduled to be removed in the near future - but for now it isn't yet a full-fledged replacement for the command.

## [v0.1.0](https://github.com/azurystudio/cheetah/releases/tag/v0.1.0)

*Published cheetah.*
