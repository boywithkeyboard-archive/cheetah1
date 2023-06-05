[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## otp (One Time Password)

```ts
import { otp } from 'https://deno.land/x/cheetah@v0.10.0/x/mod.ts'
```

### Usage

- #### Generate a random secret.

    ```ts
    const randomSecret = otp.secret(128) // with a length of 128 (64 by default)
    ```

- #### Get the 6-digit token for a given timestamp (or for now).

    ```ts
    const token = otp.secret(secret, timestamp) // omit the timestamp to use the current time
    ```

- #### Create a URI that you can use, for example, for a QR code to scan with Google Authenticator.

    ```ts
    //          otp.uri(label, issuer, secret)
    const uri = otp.uri('user@email.com', 'My Company', secret)
    ```

- #### Determine if a given token is valid.

    ```ts
    const isValid = otp.validate(token, secret)
    ```
