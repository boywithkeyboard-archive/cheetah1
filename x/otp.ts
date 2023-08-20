// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import * as OTP from 'https://deno.land/x/otpauth@v9.1.4/dist/otpauth.esm.js'

/**
 * @deprecated please import the module from `https://deno.land/x/cheetah@v1.4.0/mod.ts`!
 */
export const otp = {
  /**
   * Create a random secret.
   */
  secret(length = 64) {
    return [...Array(length)].map(() =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  },

  /**
   * Get the 6-digit token for a given timestamp.
   */
  token(secret: string, timestamp?: number) {
    const totp = new OTP.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTP.Secret.fromHex(secret),
    })

    return totp.generate({ timestamp })
  },

  /**
   * Create a URI that you can use, for example, for a QR code to scan with Google Authenticator.
   */
  uri(label: string, issuer: string, secret: string) {
    const totp = new OTP.TOTP({
      issuer,
      label,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTP.Secret.fromHex(secret),
    })

    return totp.toString()
  },

  /**
   * Determine if a given token is valid.
   */
  validate(token: string, secret: string) {
    const totp = new OTP.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTP.Secret.fromHex(secret),
    })

    return totp.validate({ token }) === 0
  },
}
