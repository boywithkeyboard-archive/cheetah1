export class ResponseContext {
  c: number
  h: Record<string, string | undefined>

  constructor() {
    this.c = 200
    this.h = {}
  }

  /**
   * Set the status code of the response.
   */
  set code(code: number) {
    this.c = code
  }

  /**
   * Attach a cookie to the response.
   */
  cookie(
    name: string,
    value: string,
    options?: {
      expiresAt?: Date
      maxAge?: number
      domain?: string
      path?: string
      secure?: boolean
      httpOnly?: boolean
      sameSite?:
        | 'strict'
        | 'lax'
        | 'none'
    },
  ) {
    let cookie = `${name}=${value};`

    this.h['set-cookie'] = (
      options?.expiresAt &&
      (cookie += ` expires=${options.expiresAt.toUTCString()};`),
        options?.maxAge && (cookie += ` max-age=${options.maxAge};`),
        options?.domain && (cookie += ` domain=${options.domain};`),
        options?.path && (cookie += ` path=${options.path};`),
        options?.secure && (cookie += ' secure;'),
        options?.httpOnly && (cookie += ' httpOnly;'),
        options?.sameSite &&
        (cookie += ` sameSite=${
          options.sameSite.charAt(0).toUpperCase() +
          options.sameSite.slice(1)
        };`),
        cookie
    )
  }

  /**
   * Attach a header to the response.
   */
  header(name: string, value: string | undefined) {
    this.h[name.toLowerCase()] = value
  }

  /**
   * Redirect the incoming request.
   *
   * @param destination e.g. https://google.com
   * @param code e.g. 301, default 307
   */
  redirect(destination: string, code = 307) {
    this.h.location = destination
    this.c = code
  }
}
