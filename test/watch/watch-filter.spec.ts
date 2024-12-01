import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it.skipIf(!process.stdout.isTTY)('should filter based on input in watch mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile, sendKeys } = await createFixture('watch-filter', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test1: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return tsquery(
      'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
    ).include('./src/**/*.ts')
  },
  test2: () => tsquery('DebuggerStatement').include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const { cwd } = paths;

    await writeFile(indexPath, `console.log('foo');`);

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const suiteSummaryDefers = [
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>()
    ];
    const [worse, filtered, worseFiltered] = suiteSummaryDefers;

    const runner = await betterer.watch({
      configPaths,
      resultsPath,
      cwd,
      reporters: [
        '@betterer/reporter',
        {
          suiteEnd(suiteSummary: BettererSuiteSummary) {
            const suiteSummaryDefer = suiteSummaryDefers.shift();
            suiteSummaryDefer?.resolve(suiteSummary);
          },
          suiteError(suiteSummary: BettererSuiteSummary) {
            const suiteSummaryDefer = suiteSummaryDefers.shift();
            suiteSummaryDefer?.resolve(suiteSummary);
          }
        }
      ],
      strict: false,
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');debugger;`);

    const worseSuiteSummary = await worse.promise;

    expect(worseSuiteSummary.runSummaries).toHaveLength(2);

    // Press "f" to enter filter mode:
    await sendKeys('f');

    // Press "2" to target "test2":
    await sendKeys('2');

    // Press "Enter" to enable the filter:
    await sendKeys('\r');

    const filteredSuiteSummary = await filtered.promise;
    expect(filteredSuiteSummary.runSummaries).toHaveLength(2);

    await writeFile(indexPath, `console.log('foo');debugger;debugger;`);

    const filteredWorseSuiteSummary = await worseFiltered.promise;
    expect(filteredWorseSuiteSummary.runSummaries).toHaveLength(2);

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
