## [v0.1.1](https://github.com/azurystudio/cheetah/releases/tag/v0.1.1)

- #### Bug Fixes

  - The `build.ts` script now uses [deno bundle](https://deno.land/manual@v1.32.5/tools/bundler) and [esbuild](https://github.com/evanw/esbuild) under the hood.

    The original script used [esbuild_deno_loader](https://github.com/lucacasonato/esbuild_deno_loader), which is probably a better solution for the future - especially since *deno bundle* is scheduled to be removed in the near future - but for now it isn't yet a full-fledged replacement for the command.

## [v0.1.0](https://github.com/azurystudio/cheetah/releases/tag/v0.1.0)

*Published cheetah.*
