---
id: tsquery-test
title: TSQuery test
slug: /tsquery-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/tsquery/src/tsquery.ts) for inspiration for your own tests!

### [`@betterer/tsquery`](https://www.npmjs.com/package/@betterer/tsquery)

Use this test to incrementally remove **TSQuery** matches from your codebase. See the [**TSQuery** documentation](https://github.com/phenomnomnominal/tsquery) for more details about the query syntax.

```typescript
import { tsquery } from '@betterer/tsquery';

export default {
  'no raw console.log': () =>
    tsquery('CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]').include(
      './src/**/*.ts'
    )
};
```

[`@betterer/tsquery`](https://www.npmjs.com/package/@betterer/tsquery) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
