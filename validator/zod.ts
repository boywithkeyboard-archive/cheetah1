import { Validator } from '../types.ts'

const zod: Validator<'zod'> = {
  name: 'zod',
  check: undefined
}

export { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
export default zod
