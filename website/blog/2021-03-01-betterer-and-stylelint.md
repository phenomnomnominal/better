---
title: Incrementally adding Stylelint rules with Betterer ☀️
authors: craig
---

I just released [v4.0.0 of **Betterer**](https://github.com/phenomnomnominal/betterer) 🎉 (now with [sweet new docs!](https://phenomnomnominal.github.io/betterer/)) and it has a bunch of simplified APIs for writing [tests](https://phenomnomnominal.github.io/betterer/docs/betterer-file-test). And just before I shipped it, I got [an issue](https://github.com/phenomnomnominal/betterer/issues/519) asking how to write a [**Stylelint**](https://stylelint.io/) test, so let's do it here and explain it line by line:

## TL;DR;

Here's the full test:

```typescript
// stylelint.ts
import { BettererFileTest } from '@betterer/betterer';
import { promises as fs } from 'node:fs';
import { Configuration, lint } from 'stylelint';

export function stylelint(configOverrides: Partial<Configuration> = {}) {
  return new BettererFileTest(async (filePaths, fileTestResult) => {
    const result = await lint({
      files: [...filePaths],
      configOverrides
    });

    await Promise.all(
      result.results.map(async (result) => {
        const contents = await fs.readFile(result.source, 'utf8');
        const file = fileTestResult.addFile(result.source, contents);
        result.warnings.forEach((warning) => {
          const { line, column, text } = warning;
          file.addIssue(line - 1, column - 1, line - 1, column - 1, text, text);
        });
      })
    );
  });
}
```

And then using the test:

```typescript
// .betterer.ts
import { stylelint } from './stylelint';

export default {
  'no stylelint issues': stylelint({
    rules: {
      'unit-no-unknown': true
    }
  }).include('./**/*.css')
};
```

<!-- truncate -->

## NTL;PR (not that long, please read 😂)

### **Stylelint**

So how does it all work? Let's start with the actual **Stylelint** part.

[**Stylelint**](https://stylelint.io/) is pretty easy to set-up. You need a `stylelintrc.json` file with configuration:

```json
{
  "extends": "stylelint-config-standard"
}
```

And then run it on your CSS files:

```bash
stylelint "**/*.css"
```

Running that does the following:

1. searches for the `stylelintrc.json` configuration file
2. reads the configuration
3. finds the valid files
4. runs the rules
5. returns the results

**Stylelint** also has a [JS API](https://stylelint.io/user-guide/usage/node-api) which we're going to use:

```typescript
import { lint } from 'stylelint';

const result = await lint({
  // ...
});
```

We could just run the above and it will test the current state of the files with the current configuration in `stylelintrc.json`. And that's great ✨!

### Augmenting the configuration:

For the **Betterer** test we want to augment the `stylelintrc.json` configuration with some extra rules... and **Stylelint** has [a really easy way](https://stylelint.io/user-guide/usage/node-api#configoverrides) to do that:

```typescript
import { Configuration, lint } from 'stylelint';

function stylelint(configOverrides: Partial<Configuration> = {}) {
  const result = await lint({
    configOverrides
  });
}
```

### Passing the list of files:

**Stylelint** also allows us to pass a specific set of files to test:

```typescript
import { Configuration, lint } from 'stylelint';

function stylelint(configOverrides: Partial<Configuration> = {}, files: Array<string>) {
  const result = await lint({
    files,
    configOverrides
  });
}
```

So we could call the `stylelint` function like:

```typescript
stylelint(
  {
    rules: {
      'unit-no-unknown': true
    }
  },
  './**/*.css'
);
```

And that will run the **Stylelint** from the `stylelinerc.json` file, plus the `unit-no-unknown` rule, on all `.css` files! Thats most of the tricky stuff sorted ⭐️!

### Hooking into **Betterer**:

This test needs to take advantage of all the snapshotting and diffing magic of **Betterer**, so we need to wrap it in a [test](https://phenomnomnominal.github.io/betterer/docs/tests). We want to be able to target individual files, so it specifically needs to be a [`BettererFileTest`](https://phenomnomnominal.github.io/betterer/docs/betterer-file-test). The function argument is the actual test, which is an `async` function that runs the linter.

```typescript
import { BettererFileTest } from '@betterer/betterer';
import { Configuration, lint } from 'stylelint';

function stylelint(configOverrides: Partial<Configuration> = {}) {
  return new BettererFileTest(async (filePaths) => {
    // ...
  });
}
```

Each time it runs **Betterer** will call that function with the relevant set of files, which we will pass along to **Stylelint**:

```typescript
import { BettererFileTest } from '@betterer/betterer';
import { Configuration, lint } from 'stylelint';

function stylelint(configOverrides: Partial<Configuration> = {}) {
  return new BettererFileTest(async (filePaths) => {
    const result = await lint({
      files: [...filePaths],
      configOverrides
    });
  });
}
```

### Adding files:

Next thing is telling **Betterer** about all the files with issues reported by **Stylelint**. To do this we can use the `BettererFileTestResult` object, which is the second parameter of the test function:

```typescript
new BettererFileTest(resolver, async (filePaths, fileTestResult) => {
  // ...
});
```

The `result` object from **Stylelint** contains a list of `results`. For each item in that list, we need to read the file with [Node's `fs` module](https://nodejs.org/api/fs.html), and then call [`addFile()`](https://phenomnomnominal.github.io/betterer/docs/betterer-file-test#addfile) with the file path (`result.source`), and the contents of the file. That returns a [`BettererFile`](https://phenomnomnominal.github.io/betterer/docs/betterer-file-test#bettererfile) object:

```typescript
import { promises as fs } from 'node:fs';

await Promise.all(
  result.results.map(async (result) => {
    const contents = await fs.readFile(result.source, 'utf8');
    const file = fileTestResult.addFile(result.source, contents);
  })
);
```

### Adding issues:

The last thing to do is convert from **Stylelint** warnings to **Betterer** issues. To do that we use the [`addIssue()`](https://phenomnomnominal.github.io/betterer/docs/betterer-file-test#addissue) function! In this case we will use the following overload:

```typescript
addIssue(startLine: number, startCol: number, endLine: number, endCol: number, message: string, hash?: string):
```

**Stylelint** only gives us the line and column for the start of the issue, so we use that as both the start position and the end position. **Betterer** expects them to be zero-indexed so we subtract `1` from both. This also means that the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=Betterer.betterer-vscode) will add a diagnostic to the whole token with the issue, which is pretty handy! We also pass the text of the issue twice, once as the `message`, and a second time as the `hash`. The `hash` is used by **Betterer** to track issues as they move around within a file. **Stylelint** adds specific details to the `message` so that makes it a good enough hash for our purposes. All up, converting an issue looks like this:

```typescript
result.warnings.forEach((warning) => {
  const { line, column, text } = warning;
  file.addIssue(line - 1, column - 1, line - 1, column - 1, text, text);
});
```

### The whole test:

Putting that all together and you get this:

```typescript
// stylelint.ts
import { BettererFileTest } from '@betterer/betterer';
import { promises as fs } from 'node:fs';
import { Configuration, lint } from 'stylelint';

export function stylelint(configOverrides: Partial<Configuration> = {}) {
  return new BettererFileTest(async (filePaths, fileTestResult) => {
    const result = await lint({
      files: [...filePaths],
      configOverrides
    });

    await Promise.all(
      result.results.map(async (result) => {
        const contents = await fs.readFile(result.source, 'utf8');
        const file = fileTestResult.addFile(result.source, contents);
        result.warnings.forEach((warning) => {
          const { line, column, text } = warning;
          file.addIssue(line - 1, column - 1, line - 1, column - 1, text, text);
        });
      })
    );
  });
}
```

And then we can use the test like this:

```typescript
// .betterer.ts
import { stylelint } from './stylelint';

export default {
  'no stylelint issues': stylelint({
    rules: {
      'unit-no-unknown': true
    }
  }).include('./**/*.css')
};
```

And that's about it! The **Stylelint** API is the real MVP here, nice job to their team! 🔥🔥🔥

Hopefully that makes sense! I'm still pretty excited by **Betterer**, so hit me up on [Twitter](https://twitter.com/phenomnominal) if you have thoughts/feelings/ideas 🦄
