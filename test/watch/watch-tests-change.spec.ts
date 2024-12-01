import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should rerun all tests if the tests file changes', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, resolve, cleanup, writeFile } = await createFixture('watch-tests-change', {
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

    await writeFile(indexPath, `console.log('foo');`);

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const suiteSummaryDefers = [
      Promise.withResolvers<BettererSuiteSummary>(),
      Promise.withResolvers<BettererSuiteSummary>()
    ];
    const [same, rerun] = suiteSummaryDefers;

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

    await writeFile(indexPath, `console.log('foo');console.dir('foo');`);

    const sameSuiteSummary = await same.promise;
    const [sameRunSummary] = sameSuiteSummary.runSummaries;

    expect(sameRunSummary.isSame).toBe(true);

    const testsContent = await readFile(paths.config);
    await writeFile(paths.config, testsContent.replace('"log"', '"dir"'));

    const rerunSuiteSummary = await rerun.promise;
    const [rerunRunSummary] = rerunSuiteSummary.runSummaries;

    expect(rerunRunSummary.isWorse).toBe(true);

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
