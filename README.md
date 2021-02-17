[![Betterer](https://raw.githubusercontent.com/phenomnomnominal/betterer/master/docs/logo.png)](https://phenomnomnominal.github.io/betterer/)

[![npm version](https://img.shields.io/npm/v/@betterer/cli.svg)](https://www.npmjs.com/package/@betterer/cli)

Are you working with a large team, or a legacy codebase? Want to make big sweeping changes over your project, but can't do it all in one go?

**`Betterer`** makes it easier to make incremental improvements to your codebase!

## Adding Betterer to your project

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

## Why?

Making widespread changes to a codebase can be really hard. When trying to make some sort improvement that affects a lot of code, one of two things often happens:

1. You start a really long-lived branch that is awful to maintain and often impossible to merge.

2. You and your team have some agreement to make the improvement slowly over time, but it gets forgotten about and never really happens.

**`Betterer`** is designed to help with this!

---

## How?

**`Betterer`** is built upon an idea popularised by [snapshot testing](https://jestjs.io/docs/en/snapshot-testing), where the status of a test is saved in a file in your codebase. But instead of a static value, **`Betterer`** keeps track of a value as it changes over time, and makes sure that the value changes how you want it to change.

When you want to make an improvement to your codebase, you just start by making a new test, defined in a `.betterer.ts` file:

```typescript
import { smaller } from '@betterer/constraints';

export default {
  'thing to improve': {
    test: () => runMyTest(),
    constraint: smaller,
    goal: 0
  }
};
```

Then you can run **`Betterer`** from the command line:

```bash
betterer
```

**`Betterer`** will run your test the first time, and store a snapshot of the result in a new file called `.betterer.results`.

```js
// BETTERER RESULTS V2.
exports[`thing to improve`] = { value: `5` };
```

The next step is to add **`Betterer`** to your build pipeline. Whenever your code builds, **`Betterer`** will run the test again and make sure the result hasn't got worse. If it gets better, then the `.betterer.results` file will be updated with the new value, which you can then commit to your codebase!

Isn't that neat!? ☀️

---

## Built-in tests

**`Betterer`** comes with a few tests of the box for some common use cases:

### ESLint

If you want to enable a new [ESLint](https://eslint.org/) rule in your codebase, you can use the `@betterer/eslint`:

```typescript
import { eslint } from '@betterer/eslint';

export default {
  'no more debuggers': eslint({ 'no-debugger': 'error' }).include('./src/**/*.ts')
};
```

### RegExp

If you want to remove anything that matches a Regular Expression within your codebase, you can use `@betterer/regexp`:

```typescript
import { regexp } from '@betterer/regexp';

export default {
  'no hack comments': regexp(/(\/\/\s*HACK)/i).include('**/*.ts')
};
```

> Note that Regular Expressions are usually a pretty unreliable way of detecting patterns in code, and you probably want to use an AST based method like TSQuery.

### TSQuery

If you want to remove anything that matches a [TSQuery](https://github.com/phenomnomnominal/tsquery) within your codebase, you can use `@betterer/tsquery`:

```typescript
import { tsquery } from '@betterer/tsquery';

export default {
  'no raw console.log': tsquery(
    './tsconfig.json',
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  )
};
```

### TypeScript

If you want to enable a new [TypeScript](https://www.typescriptlang.org/) compiler option to your codebase, you can use `@betterer/typescript`:

```typescript
import { typescript } from '@betterer/typescript';

export default {
  'stricter compilation': typescript('./tsconfig.json', {
    strict: true
  })
};
```

---

## Custom tests

It's also pretty straightforward to write your own custom tests. All you need to do is match the **`BettererTestConfigPartial`** interface, which looks something like:

```typescript
export type BettererTestConfigPartial<T = number> = {
  test: () => T | Promise<T>;
  constraint: (result: T, expected: T) => BettererConstraintResult | Promise<BettererConstraintResult>;
  goal?: T | (result: T) => boolean;
  deadline?: Date;
};
```

To help you with create your own test, there are also some built-in constraints:

```typescript
import { bigger, smaller } from '@betterer/constraints';
```

These pretty much do what they say on the box - make sure that the result from the test is a _bigger_ or _smaller_ number.

---

## CLI

### Init

Initialise **`Betterer`** in a project

```sh
betterer init -c ./path/to/config
```

#### Init options

| Name                     | Description                                  | Default          |
| ------------------------ | -------------------------------------------- | ---------------- |
| `-c`, `--config` [value] | Path to test definition file relative to CWD | `./.betterer.ts` |

### Start

Run **`Betterer`**

```sh
betterer -c ./path/to/config -r ./path/to/results -w
```

#### Start options

| Name                       | Description                                                                 | Default               |
| -------------------------- | --------------------------------------------------------------------------- | --------------------- |
| `-c`, `--config` [value]   | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`      |
| `-r`, `--results` [value]  | Path to test results file relative to CWD                                   | `./.betterer.results` |
| `-t`, `--tsconfig` [value] | Path to TypeScript config file relative to CWD                              | `null`                |
| `-f`, `--filter` [value]   | Select tests to run by RegExp. Takes multiple values                        | `[]`                  |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`               |
| `-u`, `--update`           | Force update the results file, even if things get worse                     | `false`               |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | Default reporter      |

### Watch

Run **`Betterer`** in watch mode

```sh
betterer watch -c ./path/to/config -r ./path/to/results
```

#### Watch options

| Name                       | Description                                                                 | Default               |
| -------------------------- | --------------------------------------------------------------------------- | --------------------- |
| `-c`, `--config` [value]   | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`      |
| `-r`, `--results` [value]  | Path to test results file relative to CWD                                   | `./.betterer.results` |
| `-t`, `--tsconfig` [value] | Path to TypeScript config file relative to CWD                              | `null`                |
| `-f`, `--filter` [value]   | Select tests to run by RegExp. Takes multiple values                        | `[]`                  |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`               |
| `-u`, `--update`           | Force update the results file, even if things get worse                     | `false`               |
| `-i`, `--ignore` [value]   | Ignore files by Glob when running in watch mode. Takes multiple values      | `[]`                  |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | Default reporter      |
