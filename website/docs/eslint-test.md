---
id: eslint-test
title: ESLint test
slug: /eslint-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/eslint/src/eslint.ts) for inspiration for your own tests!

### [`@betterer/eslint`](https://www.npmjs.com/package/@betterer/eslint)

Use this test to incrementally introduce new [**ESLint**](https://eslint.org/) configuration to your codebase.

From [`@betterer/eslint@6.0.0`](https://www.npmjs.com/package/@betterer/eslint), this test only works with ESLint's new flat config, so if you are using the old configuration format, you'll need to use an older version of `@betterer/eslint`.

```typescript
import { eslint } from '@betterer/eslint';

export default {
  'new eslint rules': () =>
    eslint({
      rules: {
        'no-debugger': 'error',
        'no-unsafe-finally': 'error'
      }
    }).include('./src/*.ts')
};
```

[`@betterer/eslint`](https://www.npmjs.com/package/@betterer/eslint) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
