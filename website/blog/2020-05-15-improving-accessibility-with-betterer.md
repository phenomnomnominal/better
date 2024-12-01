---
title: Improving accessibility with Betterer ☀️
authors: craig
---

So, yesterday I announced the new release of [☀️ **Betterer**](https://dev.to/phenomnominal/betterer-v1-0-0-301b), thanks if you've checked it out already!

I wanted to write another post describing a different example, this time with a custom test instead of a built-in test! Let's take a look at how we can prevent accessibility regressions (and hopefully encourage improvements!) 👀

## **Betterer** TL;DR

[**Betterer**](https://github.com/phenomnomnominal/betterer) is a test runner that helps make incremental improvements to your code! It is based upon [**Jest**'s snapshot testing](https://jestjs.io/docs/en/snapshot-testing), but with a twist...

**Betterer** works in two stages. The first time it runs a test, it will take a snapshot of the current state. From that point on, whenever it runs it will compare against that snapshot. It will either throw an error (if the test got worse ❌), or update the snapshot (if the test got better ✅). That's pretty much it!

<!-- truncate -->

## Our first **Betterer** test

Writing a test with **Betterer** involves implementing two functions! More formally, we need to implement the `BettererTest` type:

```typescript
type BettererTest<ResultType> = {
  test: () => ResultType | Promise<ResultType>;
  constraint: (result: ResultType, expected: ResultType) => ResultType | Promise<ResultType>;
};
```

So we need to write two functions:

- `test` - the action that needs to happen to get a result,
- `constraint` - the rule to apply to check if the result is _better_, _worse_ or the _same_

We can implement these in their own file, or straight in the `.betterer.ts` file. To keep it simple, we'll do the latter:

```typescript
// .betterer.ts
export default {
  'improve accessibility': {
    test: ...?,
    constraint: ...?
  }
};
```

### Writing the test

To implement our test, we're going to use [**Puppeteer**](https://github.com/puppeteer/puppeteer) and [**Axe**](https://github.com/dequelabs/axe-core). **Puppeteer** is a tool that will run a browser and load a page. **Axe** is a set of accessibility audits that we can run over a web page. We're also going to use [**Axe Puppeteer**](https://github.com/dequelabs/axe-puppeteer) which makes it a bit easier to use **Axe** with **Puppeteer**.

Lucky for us, we can take the example straight from the **Axe Puppeteer** documentation! 😍

We launch **Puppeteer**, get the `page` that it creates for us and navigate to a website. Then we execute **Axe** and get the results. Next, we close the page and the browser, before finally returning the number of violations! 🤓

```typescript
import { AxePuppeteer } from 'axe-puppeteer';
import * as puppeteer from 'puppeteer';

async function improveAccessibility() {
  const browser = await puppeteer.launch();
  const [page] = await browser.pages();

  await page.goto('https://phenomnomnominal.github.io/betterer');
  const results = await new AxePuppeteer(page).analyze();

  await page.close();
  await browser.close();

  return results.violations.length;
}
```

That's our test sorted!

### Writing the constraint

Now what about the `constraint`? Since our test returns a number, we just need to compare the two results. We want our test to improve when the result is _smaller_, so the `constraint` should look something like this:

```typescript
import { ConstraintResult } from '@betterer/constraint';

function constraint(result: number, expected: number): ConstraintResult {
  if (current === previous) {
    return ConstraintResult.same;
  }
  if (current < previous) {
    return ConstraintResult.better;
  }
  return ConstraintResult.worse;
}
```

Comparing numbers is fairly common, so we can use the pre-defined `smaller` or `bigger` constraints:

```typescript
import { smaller } from '@betterer/constraint';
```

So I kind of lied, you can write a test with just one function! 😅

### The whole thing

Putting it all together, we have our test:

```typescript
// .betterer.ts
import { smaller } from '@betterer/constraint';
import { AxePuppeteer } from 'axe-puppeteer';
import * as puppeteer from 'puppeteer';

export default {
  'improve accessibility': {
    async test() {
      const browser = await puppeteer.launch();
      const [page] = await browser.pages();

      await page.goto('https://phenomnomnominal.github.io/betterer');
      const results = await new AxePuppeteer(page).analyze();

      await page.close();
      await browser.close();

      return results.violations.length;
    },
    constraint: smaller
  }
};
```

How's that look? Not bad I reckon! **Betterer** will run the test for us and update the test snapshot whenever the results get better. That will help make sure that our audit score only goes in the right direction.

This test isn't perfect - you may noticed that it doesn't matter _what_ the violations are, but _how many_ there are! That's something that we could improve later! For now it will stop us introducing more audit violations, which is a good start ⭐️⭐️⭐️

We could improve this test by keeping track of the specific violations that occurred, so we can have a clearer definition of what _better_ or _worse_ really is, but let's leave that for another day!

## That's it!

That's all I got for now. Please let me know what you think on [Twitter](https://twitter.com/phenomnominal)! 🦄
