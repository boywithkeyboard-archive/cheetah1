[← overview](https://github.com/azurystudio/cheetah/blob/dev/guide/index.md)

## jwt (JSON Web Token)

```ts
import { jwt } from 'https://deno.land/x/cheetah@v0.7.2/x/mod.ts'
```

#### Generating a Secret

You can parse either a [CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey) as secret to the listed functions below, or use the following method to generate a string which you can store in a database.

This key can then be parsed to the functions.

```ts
import { createKey } from 'https://deno.land/x/cheetah@v0.7.2/x/mod.ts'

const key = await createKey()
```

### Usage

- #### Sign a payload.

    ```ts
    const token = await jwt.sign(payload, secret)
    ```

- #### Verify the validity of a JWT.

  The function returns the payload if the token is valid and `undefined` if it isn't.

    ```ts
    const payload = await jwt.verify(token, secret)
    ```
