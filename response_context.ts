// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Payload } from './handler.ts'

export class ResponseContext {
  #i

  constructor(__internal: {
    b: Exclude<Payload, void> | null
    c: number
    h: Headers
  }) {
    this.#i = __internal
  }

  get body(): Exclude<Payload, void> | null {
    return this.#i.b
  }

  set body(data: Exclude<Payload, void> | null) {
    this.#i.b = data
  }

  /**
   * The size of the response body (`-1` if it cannot be calculated).
   */
  get bodySize() {
    if (
      this.#i.b === null
    ) {
      return 0
    }

    let s

    switch (this.#i.b.constructor.name) {
      case 'String': {
        s = (this.#i.b as string).length
        break
      }

      case 'Object': {
        s = JSON.stringify(this.#i.b).length
        break
      }

      case 'ArrayBuffer': {
        s = (this.#i.b as ArrayBuffer).byteLength
        break
      }

      case 'Uint8Array': {
        s = (this.#i.b as ArrayBuffer).byteLength
        break
      }

      case 'Blob': {
        s = (this.#i.b as Blob).size
        break
      }

      default: {
        s = -1
        break
      }
    }

    return s
  }

  /**
   * The status code of the response.
   */
  get code() {
    return this.#i.c
  }

  set code(code: number) {
    this.#i.c = code
  }

  /**
   * Attach a cookie to the response.
   *
   * @since v1.4
   */
  setCookie(name: string, value: string, options?: {
    expires?: Date
    maxAge?: number
    domain?: string
    path?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?:
      | 'strict'
      | 'lax'
      | 'none'
  }) {
    let cookie = `${name}=${value};`

    this.#i.h.append(
      'Set-Cookie',
      (
        options?.expires &&
        (cookie += ` Expires=${options.expires.toUTCString()};`),
          options?.maxAge && (cookie += ` Max-Age=${options.maxAge};`),
          options?.domain && (cookie += ` Domain=${options.domain};`),
          options?.path && (cookie += ` Path=${options.path};`),
          options?.secure && (cookie += ' Secure;'),
          options?.httpOnly && (cookie += ' HttpOnly;'),
          options?.sameSite &&
          (cookie += ` SameSite=${
            options.sameSite.charAt(0).toUpperCase() +
            options.sameSite.slice(1)
          };`),
          cookie
      ),
    )
  }

  /**
   * Set an empty `Set-Cookie` header to delete the cookie.
   *
   * @since v1.4
   */
  deleteCookie(name: string, options?: { path?: string; domain?: string }) {
    this.setCookie(name, '', {
      expires: new Date(0),
      ...options,
    })
  }

  /**
   * Attach a header to the response.
   */
  header(name: string, value: string | undefined) {
    if (value === undefined) {
      this.#i.h.delete(name)
    } else {
      this.#i.h.set(name, value)
    }
  }

  /**
   * Redirect the incoming request.
   *
   * @param destination e.g. https://google.com
   * @param code e.g. 301, default 307
   */
  redirect(destination: string, code = 307) {
    this.#i.c = code
    this.#i.h.set('location', destination)
  }
}
