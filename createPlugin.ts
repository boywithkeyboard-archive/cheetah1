import { Context } from './Context.d.ts'
import { ResponsePayload } from './Handler.d.ts'

export type PluginMethods = {
  beforeParsing?: (request: Request) => void | Promise<void>
  beforeHandling?: (c: Context<Record<string, never>, unknown, unknown, Record<string, string>, unknown>) => ResponsePayload | Promise<ResponsePayload>
  beforeResponding?: (c: Context<Record<string, never>, unknown, unknown, Record<string, string>, unknown>) => ResponsePayload | Promise<ResponsePayload>
}

export type Plugin<Settings extends Record<string, unknown> | undefined = undefined> =
  Settings extends undefined ? PluginMethods : ((settings?: Settings) => PluginMethods)

/**
 * Create a reusable function that can be plugged into cheetah.
 * 
 * @experimental
 */
export function createPlugin<Settings extends Record<string, unknown> | undefined = undefined>(settings: Settings extends undefined ? PluginMethods : ((settings?: Settings) => PluginMethods)): Plugin<Settings> {
  return settings
}
