import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should throw if you try to queue a run after it has stopped', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, resolve, writeFile } = await createFixture('watch-queue-after-stop', {
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

    const suiteSummaryDefers = [Promise.withResolvers<BettererSuiteSummary>()];
    const [run] = suiteSummaryDefers;

    const runner = await betterer.watch({
      configPaths,
      resultsPath,
      cwd,
      reporters: [
        {
          suiteEnd(suiteSummary: BettererSuiteSummary) {
            const suiteSummaryDefer = suiteSummaryDefers.shift();
            suiteSummaryDefer?.resolve(suiteSummary);
          }
        }
      ],
      strict: false,
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');console.log('foo');`);

    await run.promise;

    await runner.stop();

    await expect(async () => {
      await runner.queue();
    }).rejects.toThrow('You cannot queue a test run after the runner has been stopped! 💥');

    await cleanup();
  });
});
