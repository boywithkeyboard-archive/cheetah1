// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../context.ts'
import { getSessionData } from './get_session_data.ts'

/**
 * Sign the user out if they're logged in.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function signOut(c: Context) {
  if (!c.__app.oauth) {
    throw new Error('Please configure the oauth module for your app!')
  }

  c.res.deleteCookie('token', {
    path: c.__app.oauth.cookie?.path ?? '/',
    ...(c.__app.oauth.cookie?.domain &&
      { domain: c.__app.oauth.cookie.domain }),
  })

  const data = await getSessionData(c)

  if (!data) {
    return
  }

  try {
    await c.__app.oauth.store.delete(c, data.identifier)
  } catch (_err) {
    //
  }

  if (typeof c.__app.oauth.onSignOut === 'function') {
    await c.__app.oauth.onSignOut(c, data.identifier)
  }
}
