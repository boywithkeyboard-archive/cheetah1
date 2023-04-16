// @deno-types='https://esm.sh/@sinclair/typebox@0.27.4/value'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/value/value.js/+esm'

const typebox = {
  name: 'typebox',
  check: Value.Check
}

export type TypeBoxValidator = typeof typebox

// @deno-types='https://esm.sh/@sinclair/typebox@0.27.4'
export { Kind, Type } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/typebox.js/+esm'
export default typebox
