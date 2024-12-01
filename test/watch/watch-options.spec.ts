import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should be able to change options while running in watch mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile } = await createFixture('watch-options', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test1: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts'),
  test2: () => tsquery('DebuggerStatement').include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const ignoredPath = resolve('./src/ignored.ts');
    const { cwd } = paths;

    await writeFile(indexPath, `console.log('foo');debugger`);

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const suiteSummaryDefers = [Promise.withResolvers<BettererSuiteSummary>()];
    const [same] = suiteSummaryDefers;

    const runner = await betterer.watch({
      configPaths,
      resultsPath,
      cwd,
      strict: false,
      workers: false
    });

    await runner.options({
      filters: '2',
      ignores: ['**/ignored.*'],
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
      ]
    });

    await writeFile(ignoredPath, `console.log('foo');`);
    await writeFile(indexPath, `console.log('foo');debugger;debugger;`);

    const sameRunSummary = await same.promise;

    expect(sameRunSummary.worse).toHaveLength(1);
    expect(sameRunSummary.skipped).toHaveLength(1);

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
