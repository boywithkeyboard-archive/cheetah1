[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## sendMail

> **Note**: This module is specifically designed for Cloudflare Workers as it uses [mailchannels](https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels) under the hood, which is free if you deploy your app to Cloudflare Workers.

```ts
import { sendMail } from 'https://deno.land/x/cheetah@v0.8.0/x/mod.ts'

await sendMail({
  subject: 'Example',
  message: 'This is just an example.',
  from: {
    name: 'John Doe',
    email: 'johndoe@custom.com'
  },
  to: 'janedoe@gmail.com'
})
```
