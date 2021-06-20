---
id: tests
title: Tests
sidebar_label: Tests
slug: /tests
---

A **Betterer** test is a programmatic definition of something that you want to improve in your codebase. Typically this will either be something that is measured _across the entire codebase_ (e.g. code coverage, or number of tests, or a specific performance metric), or something that is measured _on a per-file basis_ (e.g. type checking, or linting).

Tests are defined as code and can be re-used and shared with other projects. **Betterer** even comes with a few [built-in tests](./built-in-tests).

## Basic test

The most basic test you can write checks if a number grows or shrinks:

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
import { bigger, smaller } from '@betterer/constraints';

export default {
  'should grow': {
    test: () => getNumberOfTests(),
    constraint: bigger
  },
  'should shrink': {
    test: () => getBundleSize(),
    constraint: smaller
  }
};

function getNumberOfTests(): number {
  // ...
}

function getBundleSize(): number {
  // ...
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { bigger, smaller } = require('@betterer/constraints');

module.exports = {
  'should grow': {
    test: () => getNumberOfTests(),
    constraint: bigger
  },
  'should shrink': {
    test: () => getBundleSize(),
    constraint: smaller
  }
};

function getNumberOfTests() {
  // ...
}

function getBundleSize() {
  // ...
}
```

</TabItem>
</Tabs>

Most of the time you should wrap your test in a [`BettererTest`](./betterer-test#betterertest). This adds a few nice helpers like `only()` and `skip()`.

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
import { bigger, smaller } from '@betterer/constraints';

export default {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger
  }).only(),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller
  }).skip()
};

function getNumberOfTests(): number {
  // ...
}

function getBundleSize(): number {
  // ...
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { BettererTest } = require('@betterer/betterer');
const { bigger, smaller } = require('@betterer/constraints');

module.exports = {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger
  }).only(),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller
  }).skip()
};

function getNumberOfTests() {
  // ...
}

function getBundleSize() {
  // ...
}
```

</TabItem>
</Tabs>

## Test goal

You can add a goal to your test, which can be a function or a value. Once the goal is met, the test will be marked as "completed":

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
import { bigger, smaller } from '@betterer/constraints';

export default {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger,
    goal: (value: number) => value > 1000
  }).only(),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller,
    goal: 5
  }).skip()
};

function getNumberOfTests(): number {
  // ...
}

function getBundleSize(): number {
  // ...
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { BettererTest } = require('@betterer/betterer');
const { bigger, smaller } = require('@betterer/constraints');

module.exports = {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger,
    goal: (value) => value > 1000
  }).only(),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller,
    goal: 5
  }).skip()
};

function getNumberOfTests() {
  // ...
}

function getBundleSize() {
  // ...
}
```

</TabItem>
</Tabs>

## Test deadline

You can add a deadline to your test, which can be a [`Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), or a valid [`Date` string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#parameters). Once the deadline is passed, the test will be marked as "expired":

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
import { bigger, smaller } from '@betterer/constraints';

export default {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger,
    deadline: new Date('2021/07/03')
  }),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller,
    deadline: '2021/07/03'
  })
};

function getNumberOfTests(): number {
  // ...
}

function getBundleSize(): number {
  // ...
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { BettererTest } = require('@betterer/betterer');
const { bigger, smaller } = require('@betterer/constraints');

module.exports = {
  'should grow': new BettererTest({
    test: () => getNumberOfTests(),
    constraint: bigger,
    deadline: new Date('2021/07/03')
  }).only(),
  'should shrink': new BettererTest({
    test: () => getBundleSize(),
    constraint: smaller,
    deadline: '2021/07/03'
  }).skip()
};

function getNumberOfTests() {
  // ...
}

function getBundleSize() {
  // ...
}
```

</TabItem>
</Tabs>

## File test

If you want to write a test that checks individual files, you can write a [`BettererFileTest`](./betterer-file-test#bettererfiletest):

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
import { BettererFileTest } from '@betterer/betterer';

export default {
  'no more JavaScript files': countFiles('no more JavaScript files!').include('**/*.js')
};

function countFiles(issue: string) {
  return new BettererFileTest(async (filePaths, fileTestResult) => {
    filePaths.forEach((filePath) => {
      // In this case the file contents don't matter:
      const file = fileTestResult.addFile(filePath, '');
      // Add the issue to the first character of the file:
      file.addIssue(0, 0, issue);
    });
  });
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { BettererFileTest } = require('@betterer/betterer');

module.exports = {
  'no more JavaScript': countFiles('no more JavaScript files!').include('**/*.js')
};

function countFiles(issue) {
  return new BettererFileTest(async (filePaths, fileTestResult) => {
    filePaths.forEach((filePath) => {
      // In this case the file contents don't matter:
      const file = fileTestResult.addFile(filePath, '');
      // Add the issue to the first character of the file:
      file.addIssue(0, 0, issue);
    });
  });
}
```

</TabItem>
</Tabs>

- [Full `BettererFileTest` API](./betterer-file-test)

## Complex test

If you want to do more fancy custom things, you can have complete control over [constraints](./betterer-test#betterertestconstraint), [diffing](./betterer-test#bettererdiffer), [serialising/deserialising](./betterer-test#bettererserialiser) and [printing](./betterer-test#bettererprinter).

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
import { BettererConstraintResult } from '@betterer/constraints';

type AccessibilityReport = {
  warnings: Array<string>;
  errors: Array<string>;
};

export default {
  'should be accessible': new BettererTest<AccessibilityReport>({
    test: accessibilityTest,
    constraint: accessibilityConstraint
  })
};

function accessibilityTest(): AccessibilityReport {
  // ...
}

function accessibilityConstraint(result: AccessibilityReport, expected: AccessibilityReport): BettererConstraintResult {
  if (result.errors > expected.errors || result.warnings > expected.warnings) {
    return BettererConstraintResult.worse;
  }
  if (result.errors < expected.errors || result.warnings < expected.warnings) {
    return BettererConstraintResult.better;
  }
  return BettererConstraintResult.same;
}
```

</TabItem>
<TabItem value="js">

```javascript
// .betterer.js
const { BettererTest } = require('@betterer/betterer');
const { BettererConstraintResult } = require('@betterer/constraints');

module.exports = {
  'should be accessible': new BettererTest({
    test: accessibilityTest,
    constraint: accessibilityConstraint
  })
};

function accessibilityTest() {
  // ...
}

function accessibilityConstraint(result, expected) {
  if (result.errors > expected.errors || result.warnings > expected.warnings) {
    return BettererConstraintResult.worse;
  }
  if (result.errors < expected.errors || result.warnings < expected.warnings) {
    return BettererConstraintResult.better;
  }
  return BettererConstraintResult.same;
}
```

</TabItem>
</Tabs>

- [Full `BettererTest` API](./betterer-test)
