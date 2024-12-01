---
id: test-definition-file
title: Test definition file
sidebar_label: Test definition file
slug: /test-definition-file
---

All your tests should be exported from a test definition file. By default, **Betterer** expects this to be `.betterer.ts` or `.betterer.js`, but you can change that by using the [`--config`](./running-betterer#start-options) option when running **Betterer**. You can also split your tests into multiple test definition files and pass multiple paths to the [`--config`](./running-betterer#start-options) option.

:::info
From **Betterer** v5.0.0 all tests must be functions which return a **BettererTest**. This is so that your tests can be run in parallel! Any top-level code in you test definition file _could_ run multiple times.
:::

## Default export

You can expose tests as properties on the default export:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!-- prettier-ignore -->
<Tabs
  groupId="language"
  defaultValue="ts"
  values={[
    { label: 'TypeScript', value: 'ts', },
    { label: 'JavaScript', value: 'js', },
  ]
}>
<TabItem value="ts">

```typescript
// .betterer.ts
import { BettererTest } from '@betterer/betterer';

export default {
  'my test': () =>
    new BettererTest({
      // ... test config
    }),
  'my other test': () =>
    new BettererTest({
      // ... test config
    })
};
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
import { BettererTest } from '@betterer/betterer';

export default {
  'my test': () =>
    new BettererTest({
      // ... test config
    }),
  'my other test': () =>
    new BettererTest({
      // ... test config
    })
};
```

</TabItem>
</Tabs>

## Constant export

You can also expose tests as specific named exports:

<!-- prettier-ignore -->
<Tabs
  groupId="language"
  defaultValue="ts"
  values={[
    { label: 'TypeScript', value: 'ts', },
    { label: 'JavaScript', value: 'js', },
  ]
}>
<TabItem value="ts">

```typescript
// .betterer.ts
import { BettererTest } from '@betterer/betterer';

export function myTest() {
  return new BettererTest({
    // ... test config
  });
}

export function myOtherTest() {
  return new BettererTest({
    // ... test config
  });
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
import { BettererTest } from '@betterer/betterer';

export const myTest = () => {
  return new BettererTest({
    // ... test config
  });
};

export const myOtherTest = () => {
  return new BettererTest({
    // ... test config
  });
};
```

</TabItem>
</Tabs>

:::info
You can define your tests in other files and then import them into your test definition file and re-export! If you write a test that would be useful for others, please publish it as a package!
:::
