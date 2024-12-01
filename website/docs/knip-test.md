---
id: knip-test
title: Knip test
slug: /knip-test
---

**Betterer** ships several built-in tests to get you started. Check out the [implementations](https://github.com/phenomnomnominal/betterer/blob/master/packages/knip/src/knip.ts) for inspiration for your own tests!

### [`@betterer/knip`](https://www.npmjs.com/package/@betterer/knip)

Use this test to incrementally introduce [**Knip** checks](https://knip.dev/) to your codebase.

:::warning

This test is currently in _beta_ since the underlying [Knip](https://knip.dev/)
implementation is based on private APIs. Will stabilise when it can be migrated to
use public APIs.

:::

```typescript
import { knip } from '@betterer/knip';

export default {
  'knip dependency checks': () =>
    knip('./knip.json', { entry: ['index.{js,ts}', 'src/index.{js,ts}'] }, '--strict').include('./src/*.ts')
};
```

[`@betterer/knip`](https://www.npmjs.com/package/@betterer/knip) is a [BettererFileTest](./betterer.bettererfiletest), so you can use [`include`](./betterer.bettererresolvertest.include), [`exclude`](./betterer.bettererresolvertest.exclude), [`only`](betterer.bettererresolvertest.only), and [`skip`](betterer.bettererresolvertest.skip).
