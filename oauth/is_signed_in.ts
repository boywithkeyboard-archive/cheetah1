// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getSessionId } from './get_session_id.ts'

export async function isSignedIn(c: Context): Promise<boolean> {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  const sessionId = await getSessionId(c)

  if (!sessionId) {
    return false
  }

  return await c.__app.oauth.store.hasSession(c, sessionId)
}
