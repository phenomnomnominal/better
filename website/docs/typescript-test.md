---
id: typescript-test
title: TypeScript test
slug: /typescript-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/typescript/src/typescript.ts) for inspiration for your own tests!

### [`@betterer/typescript`](https://www.npmjs.com/package/@betterer/typescript)

Use this test to incrementally introduce [**TypeScript** configuration](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to your codebase.

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': () =>
    typescript('./tsconfig.json', {
      strict: true,
      noEmit: true
    }).include('./src/**/*.ts')
};
```

[`@betterer/typescript`](https://www.npmjs.com/package/@betterer/typescript) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
