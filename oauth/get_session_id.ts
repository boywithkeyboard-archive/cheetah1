import { Context } from '../context.ts'
import { env } from '../x/env.ts'
import { verify as jwtVerify } from '../x/jwt.ts'

export async function getSessionId(c: Context): Promise<string | undefined> {
  const header = c.req.headers.authorization

  if (!header || /^bearer\s[a-zA-Z0-9-_.]+$/.test(header) === false) {
    return
  }

  const token = header.split(' ')[1]

  const e = env<{
    jwtSecret?: string
    jwt_secret?: string
    JWT_SECRET?: string
  }>(c)

  const payload = await jwtVerify<{ sid: string }>(
    token,
    e.jwtSecret ?? e.jwt_secret ?? e.JWT_SECRET as string,
    { audience: 'oauth' },
  )

  return payload?.sid
}
