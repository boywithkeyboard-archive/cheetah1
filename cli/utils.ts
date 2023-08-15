import { brightRed, gray } from 'https://deno.land/std@0.198.0/fmt/colors.ts'

export const log = {
  error(message: string) {
    console.error(gray(`${brightRed('error')} - ${message}`))
  },
}
