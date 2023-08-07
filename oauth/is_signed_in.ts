import { Context } from '../context.ts'
import { getSessionId } from './get_session_id.ts'

export async function isSignedIn(c: Context): Promise<boolean> {
  return await getSessionId(c) !== undefined
}
