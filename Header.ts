type HeadersList = {
  'cache-control': string
  'expires': string
  'etag': string
  'content-disposition':
    | 'inline'
    | 'attachment'
    | `attachment; filename='${string}'`
    | `attachment; filename="${string}"`
    | `form-data; name='${string}'`
    | `form-data; name="${string}"`
    | `form-data; name='${string}'; filename='${string}'`
    | `form-data; name="${string}"; filename="${string}"`
  'content-length': string
  'content-type':
    | 'text/html; charset=utf-8;'
    | 'application/json; charset=utf-8;'
    | 'text/plain; charset=utf-8;'
  'content-encoding': string
  'content-language': string
  'content-location': string
}

export class Header<T extends keyof HeadersList> {
  public name
  public value

  constructor(name: T, value: HeadersList[T]) {
    this.name = name
    this.value = value
  }
}
