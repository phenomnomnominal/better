[![Betterer](https://raw.githubusercontent.com/phenomnomnominal/betterer/master/docs/logo.png)](https://phenomnomnominal.github.io/betterer/)

# `@betterer/typescript`

[![npm version](https://img.shields.io/npm/v/@betterer/typescript.svg)](https://www.npmjs.com/package/@betterer/typescript)

TypeScript test for [**`Betterer`**](https://github.com/phenomnomnominal/betterer).

## Description

Use this test to incrementally introduce TypeScript configuration to your codebase!

## Usage

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': typescript('./tsconfig.json', {
    strict: true
  })
};
```

### Skip

Skip a test by calling `.skip()`:

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': typescript(...).skip()
};
```

### Only

Run a test by itself by calling `.only()`:

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': typescript(...).only()
};
```

### Exclude

Exclude files from a test by calling `.exclude()`:

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': typescript(...).exclude(/excluded-file-regexp/)
};
```
