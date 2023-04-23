// @deno-types='https://esm.sh/@sinclair/typebox@0.28.4/value/index.d.ts'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.28.4/value/value.js/+esm'

type TypeBoxValidator = {
  name: 'typebox',
  check: typeof Value.Check
}

const typebox: TypeBoxValidator = {
  name: 'typebox',
  check: Value.Check
}

// @deno-types='https://esm.sh/@sinclair/typebox@0.28.4'
export { Kind, Type } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.28.4/typebox.js/+esm'
export default typebox
