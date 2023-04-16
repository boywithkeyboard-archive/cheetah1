const zod = {
  name: 'zod',
  check: undefined
}

export type ZodValidator = typeof zod

export { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
export default zod
