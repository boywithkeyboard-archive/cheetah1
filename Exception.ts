/**
 * @example
 * 
 * ```js
 * // Not Found
 * throw new Exception('Not Found')
 * throw new Exception(404)
 * 
 * // Access Denied
 * throw new Exception('Access Denied')
 * throw new Exception(403)
 * 
 * // Something Went Wrong
 * throw new Exception('Something Went Wrong')
 * throw new Exception(500)
 * 
 * // Bad Request
 * throw new Exception('Bad Request')
 * throw new Exception(400)
 * 
 * // Payload Too Large
 * throw new Exception('Payload Too Large')
 * throw new Exception(413)
 * 
 * // Too Many Requests
 * throw new Exception('Too Many Requests')
 * throw new Exception(429)
 * ```
 */
export class Exception {
  public response

  constructor(
    message:
      | 'Not Found'
      | 'Access Denied'
      | 'Something Went Wrong'
      | 'Bad Request'
      | 'Payload Too Large'
      | 'Too Many Requests'
      | 404
      | 403
      | 500
      | 400
      | 413
      | 429
  )

  constructor(
    message: string,
    code?: number
  )

  constructor(
    message: string | number,
    code?: number
  ) {
    const _message = typeof message === 'string'
      ? message
      : message === 404
      ? 'Not Found'
      : message === 400
      ? 'Bad Request'
      : message === 403
      ? 'Access Denied'
      : message === 413
      ? 'Payload Too Large'
      : message === 429
      ? 'Too Many Requests'
      : 'Something Went Wrong'

    const _code = code
      ? code
      : typeof message === 'number'
      ? message
      : message === 'Access Denied'
      ? 403
      : message === 'Bad Request'
      ? 400
      : message === 'Not Found'
      ? 404
      : message === 'Payload Too Large'
      ? 413
      : message === 'Too Many Requests'
      ? 429
      : message === 'Something Went Wrong'
      ? 500
      : 400

    this.response = (request: Request) => {
      const acceptHeader = request.headers.get('accept')

      const json = acceptHeader
        ? acceptHeader.indexOf('application/json') > -1 || acceptHeader.indexOf('*/*') > -1
        : false

      const body = json
        ? JSON.stringify({ message: _message, code: _code })
        : _message

      return new Response(
        body,
        {
          headers: {
            'content-length': body.length.toString(),
            'content-type': `${json ? 'application/json' : 'text/plain'}; charset=utf-8;`
          },
          status: _code
        }
      )
    }
  }
}
