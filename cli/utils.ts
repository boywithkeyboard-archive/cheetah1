// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { brightRed, gray } from 'std/fmt/colors.ts'

export function logError(message: string) {
  console.error(gray(`${brightRed('error')} - ${message}`))
}
