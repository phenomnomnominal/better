---
id: running-betterer
title: Running Betterer
sidebar_label: Running Betterer
slug: /running-betterer
---

You can run **Betterer** with the **Betterer CLI**. If you used `npx @betterer/cli init` to add **Betterer** to your project, `@betterer/cli` will already be added as a dependency, and there will be a `betterer` script in your `package.json` file.

## Start mode

If you just want to run your tests once (like before commiting your code), you can use `betterer start` or just `betterer`:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer start` or just `yarn betterer` to run **Betterer** once.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer start` or just `npm run betterer` to run **Betterer** once.

  </TabItem>
</Tabs>

<!-- prettier-ignore -->
<div className="video__container">
  <video loop autoPlay muted width="80%">
    <source src="/betterer/videos/start.mp4" type="video/mp4"/>
  </video>
</div>

**Betterer** will run your tests, compare the new results against the expected results, and report the updated status. If any test result is better, the [`.betterer.results`](./results-file) file will be updated with the new result ✅! If it gets worse, your test will fail and **Betterer** will throw an error ❌!

:::info
If it is your first time running a **Betterer** test it will create a [`.betterer.results`](./results-file) file!
:::

### Including and excluding files

If you want to test specific files, you can pass a file path or [glob](https://www.npmjs.com/package/glob#glob-primer) directly to the `start` command.

If you include files with a generic glob and want to exclude a specific file, you can use the [`--exclude`](./running-betterer#start-options) option, which can take multiple values. Each exclude pattern should be a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).

#### Examples

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer "src/**/*.js"` to run **Betterer** on all JavaScript files within `src`.

Run `yarn betterer "src/**/*.js" "src/**/*.css"` to run **Betterer** on all JavaScript and CSS files within `src`.

Run `yarn betterer "src/**/*.js" "src/**/*.css" --exclude excluded.js` to run **Betterer** on all JavaScript and CSS files within `src`, but not any files called `excluded.js`.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer "src/**/*.js"` to run **Betterer** on all JavaScript files within `src`.

Run `npm run betterer "src/**/*.js" "src/**/*.css"` to run **Betterer** on all JavaScript and CSS files within `src`.

Run `npm run betterer "src/**/*.js" "src/**/*.css" --exclude excluded.js` to run **Betterer** on all JavaScript and CSS files within `src`, but not any files called `excluded.js`.

  </TabItem>
</Tabs>

:::warning
**Betterer** will only run [File Tests](./betterer.bettererfiletest) when targeting specific files.
:::

### Start options

You can pass the following options to `start`:

| Option                     | Description                                                                 | Default                  |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| `--cache`                  | When present, Betterer will only run on changed files.                      | `false`                  |
| `--cachePath` [value]      | Path to Betterer cache file relative to CWD                                 | `./.betterer.cache`      |
| `-c`, `--config` [value]   | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`         |
| `--exclude` [value]        | RegExp filter for files to exclude. Takes multiple values                   | `[]`                     |
| `-f`, `--filter` [value]   | Select tests to run by RegExp. Takes multiple values                        | `[]`                     |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | `['@betterer/reporter']` |
| `-r`, `--results` [value]  | Path to test results file relative to CWD                                   | `./.betterer.results`    |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`                  |
| `--strict`                 | Hide the "how to update" message and set `--update` to `false`.             | `false`                  |
| `-t`, `--tsconfig` [value] | Path to TypeScript config file relative to CWD                              | `null`                   |
| `-u`, `--update`           | Update the results file, even if things get worse                           | `false`                  |
| `--workers`                | number of workers to use. Set to `false` to run tests serially.             | Number of CPUs - 2       |

#### Read more about Start mode

- [The test definition file](./test-definition-file)
- [The results file](./results-file)
- [Betterer and TypeScript](./betterer-and-typescript)
- [Filters](./filters)
- [Updating results](./updating-results)
- [Reporters](./reporters)

## CI mode

When you run your tests on your CI server (like as part of a build review process), you should use `betterer ci`:

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer ci` to run **Betterer** in CI mode.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer ci` to run **Betterer** in CI mode.

  </TabItem>
</Tabs>

**Betterer** will run your tests, compare the new results against the expected results, and report the updated status. If there is any difference between the new results and the expected results, then the committed [results file](./results-file) doesn't reflect the real state of the codebase, and **Betterer** will throw an error ❌.

### CI options

You can pass the following options to `ci`:

| Option                     | Description                                                                 | Default                  |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| `--cache`                  | When present, Betterer will only run on changed files.                      | `false`                  |
| `--cachePath` [value]      | Path to Betterer cache file relative to CWD                                 | `./.betterer.cache`      |
| `-c`, `--config` [value]   | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`         |
| `--exclude` [value]        | RegExp filter for files to exclude. Takes multiple values                   | `[]`                     |
| `-f`, `--filter` [value]   | Select tests to run by RegExp. Takes multiple values                        | `[]`                     |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | `['@betterer/reporter']` |
| `-r`, `--results` [value]  | Path to test results file relative to CWD                                   | `./.betterer.results`    |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`                  |
| `-t`, `--tsconfig` [value] | Path to TypeScript config file relative to CWD                              | `null`                   |
| `--workers`                | number of workers to use. Set to `false` to run tests serially.             | Number of CPUs - 2       |

#### Read more about CI mode

- [Suggested workflow](./workflow)

## Pre-commit mode

If you just want to run your tests in a pre-commit hook, you can use `betterer precommit`:

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer precommit` to run **Betterer** in Pre-commit mode.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer precommit` to run **Betterer** in Pre-commit mode.

  </TabItem>
</Tabs>

**Betterer** will run your tests, and if there is a change in the [results file](./results-file) then **Betterer** will add it to the commit.

### Pre-commit options

You can pass the following options to `precommit`:

| Option                     | Description                                                                 | Default                  |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| `--cache`                  | When present, Betterer will only run on changed files.                      | `false`                  |
| `--cachePath` [value]      | Path to Betterer cache file relative to CWD                                 | `./.betterer.cache`      |
| `-c`, `--config` [value]   | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`         |
| `--exclude` [value]        | RegExp filter for files to exclude. Takes multiple values                   | `[]`                     |
| `-f`, `--filter` [value]   | Select tests to run by RegExp. Takes multiple values                        | `[]`                     |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | `['@betterer/reporter']` |
| `-r`, `--results` [value]  | Path to test results file relative to CWD                                   | `./.betterer.results`    |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`                  |
| `-t`, `--tsconfig` [value] | Path to TypeScript config file relative to CWD                              | `null`                   |
| `--workers`                | number of workers to use. Set to `false` to run tests serially.             | Number of CPUs - 2       |

#### Read more about Pre-commit mode

- [Suggested workflow](./workflow)

## Watch mode

If you just want to run your tests each time your files change (like when working to fix a whole bunch of issues), you can use `betterer watch`:

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer watch` to run **Betterer** in watch mode.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer watch` to run **Betterer** in watch mode.

  </TabItem>
</Tabs>

<!-- prettier-ignore -->
<div className="video__container">
  <video loop autoPlay muted width="80%">
    <source src="/betterer/videos/watch.mp4" type="video/mp4"/>
  </video>
</div>

### Watch mode controls

- Press `q` to quit
- Press `f` to modify filters
- Press `i` to modify ignores

**Betterer** will start watch mode, and wait for any files to change. When a file is saved, it will run any tests that apply to that file, compare the new results against the saved results, and report the updated status. When you quit watch mode (by pressing `q`), the [`.betterer.results`](./results-file) file will be updated with the new results ✅!

:::warning
When running in watch mode, **Betterer** will currently only run [File Tests](./betterer.bettererfiletest). This might change in the future, so please raise an issue with your use case!
:::

### Watch options

You can pass the following options to `watch`:

| Option                     | Description                                                                 | Default                  |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| `--cache`                  | When present, Betterer will only run on changed files.                      | `false`                  |
| `--cachePath` [value]      | Path to Betterer cache file relative to CWD                                 | `./.betterer.cache`      |
| `-c`, `--config` [path]    | Path to test definition file relative to CWD. Takes multiple values         | `./.betterer.ts`         |
| `-f`, `--filter` [regexp]  | Select tests to run by RegExp. Takes multiple values                        | `[]`                     |
| `-i`, `--ignore` [glob]    | Ignore files by Glob when running in watch mode. Takes multiple values      | `[]`                     |
| `-R`, `--reporter` [value] | npm package name or file path to a Betterer reporter. Takes multiple values | `['@betterer/reporter']` |
| `-r`, `--results` [path]   | Path to test results file relative to CWD                                   | `./.betterer.results`    |
| `-s`, `--silent`           | Disable all default reporters. Custom reporters still work normally.        | `false`                  |
| `-t`, `--tsconfig` [path]  | Path to TypeScript config file relative to CWD                              | `null`                   |
| `--workers`                | number of workers to use. Set to `false` to run tests serially.             | Number of CPUs - 2       |

### Ignoring files

If you want to ignore changes in certain files when running in [Watch mode](./running-betterer#watch-mode-run-your-tests-when-files-change), you can use the [`--ignore`](./running-betterer#watch-options) option, which can take multiple values. Each ignore pattern should be a [glob](https://www.npmjs.com/package/glob#glob-primer).

<!-- prettier-ignore -->
<Tabs
  groupId="package-manager"
  defaultValue="yarn"
  values={[
    { label: 'Yarn', value: 'yarn' },
    { label: 'npm', value: 'npm' },
  ]}>
  <TabItem
    value="yarn">

Run `yarn betterer watch --ignore **/*.js` to run **Betterer** with an ignore.

Run `yarn betterer watch --ignore "**/*.js" --ignore "**/*.css"` to run **Betterer** with multiple ignores.

  </TabItem>
  <TabItem
    value="npm">

Run `npm run betterer watch --ignore **/*.js` to run **Betterer** with an ignore.

Run `npm run betterer watch --ignore "**/*.js" --ignore "**/*.css"` to run **Betterer** with multiple ignores.

  </TabItem>
</Tabs>

:::info
When running in [Watch mode](./running-betterer#watch-mode-run-your-tests-when-files-change), ignores can be updated on the fly by first pressing `i`, and then modifying the current ignore.
:::
