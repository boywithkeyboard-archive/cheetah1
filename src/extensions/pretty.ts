// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { createExtension } from './extension.ts'

function sortObject(object: unknown) {
  if (typeof object != 'object' || object instanceof Array || object === null) {
    return object
  }

  const keys = Object.keys(object).sort()

  const newObject: Record<string, unknown> = {}

  for (let i = 0; i < keys.length; i++) {
    newObject[keys[i]] = sortObject(
      (object as Record<string, unknown>)[keys[i]],
    )
  }

  return newObject
}

/**
 * An extension to jazz up the response body by adding indentation and sorting the keys alphabetically.
 *
 * @since v1.1
 */
export const pretty = createExtension<{
  /**
   * Apply indentation to your response body. Set it to `0` to disable indentation.
   *
   * @default 2
   */
  indentSize?: number
  /**
   * Whether to sort the fields alphabetically.
   *
   * @default false
   */
  sort?: boolean
}>({
  onResponse({
    c,
    _: {
      indentSize = 2,
      sort = true,
    } = {},
  }) {
    let body = c.res.body

    if (body === null || body.constructor.name !== 'Object') {
      return
    }

    c.res.header('content-type', 'application/json; charset=utf-8')

    if (sort) {
      body = sortObject(body) as Record<string, unknown>
    }

    c.res.body = JSON.stringify(
      body,
      null,
      indentSize,
    )
  },
})
