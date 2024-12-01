---
id: angular-test
title: Angular test
slug: /angular-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/angular/src/angular.ts) for inspiration for your own tests!

### [`@betterer/angular`](https://www.npmjs.com/package/@betterer/angular)

Use this test to incrementally introduce [**Angular** compiler configuration](https://angular.io/guide/angular-compiler-options) to your codebase.

```typescript
import { angular } from '@betterer/angular';

export default {
  'stricter template compilation': () =>
    angular('./tsconfig.json', {
      strictTemplates: true
    }).include('./src/*.ts', './src/*.html')
};
```

[`@betterer/angular`](https://www.npmjs.com/package/@betterer/angular) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
