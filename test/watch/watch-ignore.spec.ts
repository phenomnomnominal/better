import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it.skipIf(!process.stdout.isTTY)('should ignore based on input in watch mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile, sendKeys } = await createFixture('watch-ignore', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `,
      './src/ignored.ts': ''
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const ignoredPath = resolve('./src/ignored.ts');
    const { cwd } = paths;

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const suiteSummaryDefers = [
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>()
    ];
    const [allFiles, ignored] = suiteSummaryDefers;

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
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');`);
    await writeFile(ignoredPath, `console.log('foo');`);

    const allSuiteSummary = await allFiles.promise;
    const [allRunSummary] = allSuiteSummary.runSummaries;
    expect(allRunSummary.filePaths).toHaveLength(2);

    // Press "p" which should do nothing:
    await sendKeys('p');

    // Press "i" to enter ignore mode:
    await sendKeys('i');

    // Press "ignored" to ignore "ignored.ts":
    await sendKeys('**/ignored.*');

    // Press "Enter" to enable the filter:
    await sendKeys('\r');

    await writeFile(indexPath, `console.log('foo');console.log('foo');`);
    await writeFile(ignoredPath, `console.log('foo');console.log('foo');`);

    const ignoredSuiteSummary = await ignored.promise;
    const [ignoredRunSummary] = ignoredSuiteSummary.runSummaries;
    expect(ignoredRunSummary.filePaths).toHaveLength(1);

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
