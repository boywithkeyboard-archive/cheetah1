import { Plugin, PluginMethods } from './types.ts'

/**
 * Create a reusable function that can be plugged into cheetah.
 * 
 * @experimental
 */
export function createPlugin<Settings extends Record<string, unknown> | undefined = undefined>(settings: Settings extends undefined ? PluginMethods : ((settings: Settings) => PluginMethods)): Plugin<Settings> {
  return settings
}
