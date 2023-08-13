import { Context } from '../context.ts'

export async function signInWithPassword(c: Context) {
  try {
    const body = await c.req.json()

    c.res.cookie('', '')

    c.res.body = { accessToken: '' }

    return {
      accessToken: '',
      refreshToken: '',
    }
  } catch (_err) {
    return
  }
}
