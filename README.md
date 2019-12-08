[![betterer](https://github.com/phenomnomnominal/betterer/blob/master/docs/logo.png)](https://phenomnomnominal.github.io/betterer/)

[![npm version](https://img.shields.io/npm/v/@betterer/cli.svg)](https://www.npmjs.com/package/@betterer/cli)

**`Betterer`** makes it easier to make incremental improvements to your codebase!

## Set up:

If you want everything to happen magically, run the following from the root of your project:

```bash
npx @betterer/cli init
```

To do it yourself, run the following from the root of your project:

```bash
npm install @betterer/cli --save-dev
```

You'll then need to make your own test file and test commands.

---

## Why?:

Making widespread changes to a codebase can be really hard. Often when trying to make some sort improvement that affects a lot of code, one of two things happens:

1. You start a really long-lived branch that is awful to maintain and often impossible to merge.

2. You and your team have some agreement to make the improvement slowly over time, but it gets forgotten about and never really happens.

**`Betterer`** is meant to help with this!

---

## How?:

**`Betterer`** is built upon an idea popularised by [snapshot testing](https://jestjs.io/docs/en/snapshot-testing), where the status of a test is saved in a file in your codebase. But instead of a static value, **`betterer`** keeps track of a value as it changes over time, and makes sure that the value changes how you want it to change.

When you want to make an improvement to your codebase, you just start by making a new test, defined in a `.betterer.ts` file:

```typescript
export default {
  'thing to improve': {
    test: () => runMyTest(),
    constraint: (current, previous) => current < previous,
    goal: 0
  }
};
```

Then you can run **`betterer`** from the command line:

```bash
betterer
```

**`Betterer`** will run your test the first time, and store the result in a new file called `.betterer.results`.

```js
// BETTERER RESULTS V1.
exports[`thing to improve`] = { timestamp: 1569148039311, value: `5` };
```

The next step is to add **`betterer`** to your build pipeline. Whenever your code builds, **`betterer`** will run the test again and make sure the result hasn't got worse. If it gets better, then the `.betterer.results` file will be updated with the new value, which you can then commit to your codebase!

Isn't that neat!? ☀️

---

## Built-in **`betterers`**:

Each of these test configurations is called a **`betterer`**! The API should be flexible enough to do whatever you want, but **`betterer`** comes with a few out of the box:

### ESLint

If you want to enable a new [ESLint](https://eslint.org/) rule in your codebase, you can use the `eslintBetterer`:

```typescript
import { eslintBetterer } from '@betterer/eslint';

export default {
  'no more debuggers': eslintBetterer('./src/**/*.ts', ['no-debugger', 'error'])
};
```

### RegExp

If you want to remove anything that matches a Regular Expression within your codebase, you can use the `regexpBetterer`:

```typescript
import { regexpBetterer } from '@betterer/regexp';

export default {
  'no hack comments': regexpBetterer('**/*.ts', /(\/\/\s*HACK)/i)
};
```

> Note that Regular Expressions are usually a pretty unreliable way of detecting patterns in code, and you probably want to use an AST based method like TSQuery.

### TSQuery

If you want to remove anything that matches a [TSQuery](https://github.com/phenomnomnominal/tsquery) within your codebase, you can use the `tsqueryBetterer`:

```typescript
import { tsqueryBetterer } from '@betterer/tsquery';

export default {
  'no raw console.log': tsqueryBetterer(
    './tsconfig.json',
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  )
};
```

### TypeScript

If you want to enable a new [TypeScript](https://www.typescriptlang.org/) compiler option to your codebase, you can use the `typescriptBetterer`:

```typescript
import { typescriptBetterer } from '@betterer/typescript';

export default {
  'stricter compilation': typescriptBetterer('./tsconfig.json', {
    strict: true
  })
};
```

---

## Custom **`betterers`**:

It's also pretty straightforward to write your own custom **`betterer`**. All you need to do is match the **`Betterer`** interface, which looks something like:

```typescript
export type Betterer<T = number> = {
  test: () => T | Promise<T>;
  constraint: (
    current: T,
    previous: T
  ) => ConstraintResult | Promise<ConstraintResult>;
  goal: T;
};
```

To help you with create your own **`betterers`**, there are also some built-in constraints:

```typescript
import { bigger, smaller } from '@betterer/constraints';
```

These pretty much do what they say on the box - make sure that the result from the test is a _bigger_ or _smaller_ number.

---

## CLI Options:

You can change the path to the test file, the path to the results file, or the tests you want to run, using the CLI:

```sh
betterer -c ./path/to/config -r ./path/to/results -f my-test
```

### Options

| Name                      | Description                                  | Default               |
| ------------------------- | -------------------------------------------- | --------------------- |
| `-c`, `--config` [value]  | Path to test definition file relative to CWD | `./.betterer.ts`      |
| `-r`, `--results` [value] | Path to test results file relative to CWD    | `./.betterer.results` |
| `-f`, `--filter` [value]  | RegExp filter for tests to run               | `.*`                  |
