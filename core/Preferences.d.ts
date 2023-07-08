import { Validator } from '../mod.ts'

export type Preferences<
  V extends Validator = never,
> = {
  /**
   * A prefix for all routes, e.g. `/api`.
   *
   * @default '/'
   */
  base?: `/${string}`

  /**
   * Enable Cross-Origin Resource Sharing (CORS) for your app by setting a origin, e.g. `*`.
   */
  cors?: string

  cache?: {
    /**
     * A unique name for your cache.
     */
    name: string

    /**
     * Duration in seconds for how long a response should be cached.
     *
     * @since v0.11
     */
    maxAge?: number
  }

  /**
   * Enable **Debug Mode**. As a result, every fetch and error event will be logged.
   *
   * @default false
   */
  debug?: boolean

  /**
   * Set a validator to validate the body, cookies, headers, and query parameters of the incoming request.
   */
  validator?: V

  /**
   * If enabled, cheetah will attempt to find the matching `.get()` handler for an incoming HEAD request. Your existing `.head()` handlers won't be impacted.
   *
   * @default false
   * @since v0.11
   */
  preflight?: boolean

  /**
   * Set a custom error handler.
   */
  error?: (error: unknown, request: Request) => Response | Promise<Response>

  /**
   * Set a custom 404 handler.
   */
  notFound?: (request: Request) => Response | Promise<Response>
}
