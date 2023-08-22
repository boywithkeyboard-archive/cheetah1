// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { brightRed, gray } from 'https://deno.land/std@0.199.0/fmt/colors.ts'

export function logError(message: string) {
  console.error(gray(`${brightRed('error')} - ${message}`))
}
