// Code adapted from
// https://github.com/tw-in-js/twind/blob/main/packages/with-remix/src/index.ts
// Licensed under MIT, which is compatible with Apache-2.0

import {
  BaseTheme,
  ExtractThemes,
  install as install$,
  Preset,
  Twind,
  TwindConfig,
  TwindUserConfig,
} from 'https://esm.sh/@twind/core@1.1.3'

function install<Theme extends BaseTheme = BaseTheme>(
  config: TwindConfig<Theme>,
  isProduction?: boolean,
): Twind<Theme & BaseTheme>

function install<Theme = BaseTheme, Presets extends Preset[] = Preset[]>(
  config: TwindUserConfig<Theme, Presets>,
  isProduction?: boolean,
): Twind<BaseTheme & ExtractThemes<Theme, Presets>>

function install(
  config: TwindConfig | TwindUserConfig,
  isProduction?: boolean,
): Twind {
  return install$(config as TwindConfig, isProduction)
}

export default install
