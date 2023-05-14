// @deno-types='https://esm.sh/@sinclair/typebox@0.28.9/value'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.28.9/value/value.js/+esm'

export type TypeBoxValidator = {
  name: 'typebox',
  check: typeof Value.Check
}

const typebox: TypeBoxValidator = {
  name: 'typebox',
  check: Value.Check
}

// @deno-types='https://esm.sh/@sinclair/typebox@0.28.9'
export { Kind, Type } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.28.9/typebox.js/+esm'
export default typebox
