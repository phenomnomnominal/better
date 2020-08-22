[![Betterer](https://raw.githubusercontent.com/phenomnomnominal/betterer/master/docs/logo.png)](https://phenomnomnominal.github.io/betterer/)

# `@betterer/errors`

[![npm version](https://img.shields.io/npm/v/@betterer/errors.svg)](https://www.npmjs.com/package/@betterer/errors)

Error handler used within [**`Betterer`**](https://github.com/phenomnomnominal/betterer).

## Usage

### Register Error

Register an error type with the handler:

```typescript
import { registerError } from '@betterer/errors';

const MY_ERROR = registerError((details) => `Something went wrong: ${details}`);
```

### Log Error

> ## 🚨🚨🚨 THIS FUNCTION SHOULD ONLY BE USED WITHIN THE BETTERER MONOREPO 🚨🚨🚨

Log a registered error type:

```typescript
import { logErrorΔ, registerError } from '@betterer/errors';

const MY_ERROR = registerError(details => `Something went wrong: "${details}"`);

try {
    throw MY_ERROR('OOPS!):
} catch (e) {
    logErrorΔ(e); // 'Something went wrong: "OOPS"'
}
```
