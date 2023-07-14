export type ResponseData<T extends 'json' | 'text' | 'buffer' | 'formData'> =
  T extends 'json' ? Record<string, unknown>
    : T extends 'text' ? string
    : T extends 'buffer' ? Uint8Array
    : FormData

export class Cub {
  #domain
  #encoding
  #protocol

  constructor({
    domain,
    encoding,
    protocol = 'https',
  }: {
    domain: string
    /** @default undefined */
    encoding?: 'msgpack'
    /** @default 'https' */
    protocol?: 'https' | 'http'
  }) {
    this.#domain = domain
    this.#encoding = encoding
    this.#protocol = protocol
  }

  async #fetch<T extends 'json' | 'text' | 'buffer' | 'formData'>(
    pathname: string,
    type: T,
  ): Promise<{
    code: number
    data: ResponseData<T> | undefined
  }> {
    try {
      const res = await fetch(`${this.#protocol}://${this.#domain}${pathname}`)

      const data: ResponseData<T> = type === 'json'
        ? await res.json()
        : type === 'text'
        ? await res.text()
        : type === 'formData'
        ? await res.formData()
        : new Uint8Array(await res.arrayBuffer())

      return {
        code: res.status,
        data,
      }
    } catch (_err) {
      return {
        code: -1,
        data: undefined,
      }
    }
  }

  async delete(pathname: string) {
  }

  async get(pathname: string) {
  }

  async head(pathname: string) {
  }

  async patch(pathname: string) {
  }

  async post(pathname: string) {
  }

  async put(pathname: string) {
  }
}
