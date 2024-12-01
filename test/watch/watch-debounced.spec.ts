import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should debounce runs when multiple files change', async () => {
    const { watch } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile } = await createFixture('watch-debounce', {
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
    const filePath = resolve('./src/file.ts');
    const { cwd } = paths;

    const suiteSummaryDefer = Promise.withResolvers<BettererSuiteSummary>();

    const runner = await watch({
      configPaths,
      resultsPath,
      cwd,
      reporters: [
        '@betterer/reporter',
        {
          suiteEnd(suiteSummary: BettererSuiteSummary) {
            suiteSummaryDefer.resolve(suiteSummary);
          }
        }
      ],
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');`);
    await writeFile(filePath, `console.log('foo');\nconsole.log('foo');`);
    const suiteSummary = await suiteSummaryDefer.promise;

    await runner.stop();

    expect(suiteSummary.runSummaries).toHaveLength(1);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
