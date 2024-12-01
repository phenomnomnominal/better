import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should run in watch mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile } = await createFixture('watch', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const { cwd } = paths;

    await writeFile(indexPath, `console.log('foo');console.log('foo');`);

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const suiteSummaryDefers = [
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>()
    ];
    const [worse, same, better] = suiteSummaryDefers;

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

    await writeFile(indexPath, `console.log('foo');\nconsole.log('foo');console.log('foo');`);

    const worseSuiteSummary = await worse.promise;
    const [worseRunSummary] = worseSuiteSummary.runSummaries;

    expect(worseRunSummary.isWorse).toBe(true);

    await writeFile(indexPath, `console.log('foo');console.log('foo');`);

    const sameSuiteSummary = await same.promise;
    const [sameRunSummary] = sameSuiteSummary.runSummaries;

    expect(sameRunSummary.isSame).toBe(true);

    await writeFile(indexPath, `console.log('bar');`);

    const betterSuiteSummary = await better.promise;
    const [betterRunSummary] = betterSuiteSummary.runSummaries;

    expect(betterRunSummary.isBetter).toBe(true);

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
