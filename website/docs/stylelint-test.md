---
id: stylelint-test
title: Stylelint test
slug: /stylelint-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/stylelint/src/stylelint.ts) for inspiration for your own tests!

### [`@betterer/stylelint`](https://www.npmjs.com/package/@betterer/stylelint)

Use this test to incrementally introduce new [**Stylelint**](https://stylelint.io/) rules to your codebase.

```typescript
import { stylelint } from '@betterer/stylelint';

export default {
  'no unknown units': () =>
    stylelint({
      rules: {
        'unit-no-unknown': true
      }
    }).include('**/*.css')
};
```

[`@betterer/stylelint`](https://www.npmjs.com/package/@betterer/stylelint) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
