import { Validator } from '../_validator.d.ts'

const zod: Validator<'zod'> = {
  name: 'zod',
  check: undefined
}

export default zod
export { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
