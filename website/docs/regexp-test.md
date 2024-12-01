---
id: regexp-test
title: RegExp test
slug: /regexp-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/regexp/src/regexp.ts) for inspiration for your own tests!

### [`@betterer/regexp`](https://www.npmjs.com/package/@betterer/regexp)

Use this test to incrementally remove [**RegExp**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) matches from your codebase.

```typescript
import { regexp } from '@betterer/regexp';

export default {
  'no hack comments': () => regexp(/(\/\/\s*HACK)/i).include('**/*.ts')
};
```

[`@betterer/regexp`](https://www.npmjs.com/package/@betterer/regexp) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
