// @deno-types='https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/value/value.d.ts'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/value/value.js/+esm'
import { Validator } from '../_validator.d.ts'

const typebox: Validator<'typebox'> = {
  name: 'typebox',
  check: Value.Check
}

export default typebox
// @deno-types='https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/typebox.d.ts'
export { Type, Kind } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.27.4/typebox.js/+esm'
