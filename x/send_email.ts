// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import { sendMail as _sendMail } from './send_mail.ts'

/**
 * Send an email through [mailchannels](https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels).
 *
 * @deprecated please import the module from `https://deno.land/x/cheetah/x/send_mail.ts`.
 */
export const sendMail = _sendMail // TODO remove at v2.0
