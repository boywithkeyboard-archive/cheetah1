// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Preset } from 'https://deno.land/x/authenticus@v2.0.3/createPreset.ts'
import {
  GitHub as githubPreset,
  Google as googlePreset,
} from 'https://deno.land/x/authenticus@v2.0.3/mod.ts'
import { OAuthMethod } from './types.ts'

export type OAuthClient = {
  name: OAuthMethod
  // deno-lint-ignore no-explicit-any
  preset: Preset<any, any, any>
}

/**
 * @since v1.3
 */
export const Google: OAuthClient = {
  name: 'google',
  preset: googlePreset,
}

/**
 * @since v1.3
 */
export const GitHub: OAuthClient = {
  name: 'github',
  preset: githubPreset,
}
