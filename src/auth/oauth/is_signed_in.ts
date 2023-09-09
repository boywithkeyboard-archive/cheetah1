// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { Context } from '../../contexts/context.ts'
import { getSessionId } from './get_session_id.ts'

/**
 * Check if the user is logged in.
 *
 * @namespace oauth
 * @since v1.3
 */
export async function isSignedIn(c: Context): Promise<boolean> {
  return await getSessionId(c) !== undefined
}
