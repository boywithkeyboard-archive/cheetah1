// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getSessionId } from './get_session_id.ts'

/**
 * @since v1.3
 */
export async function signOut(c: Context) {
  const sessionId = await getSessionId(c)

  if (!sessionId) {
    return
  }
}
