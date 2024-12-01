import type { BettererSuiteSummary } from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should ignore .gitignored files', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile } = await createFixture('watch-ignored', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `,
      './src/.gitignore': `
ignored.ts
      `,
      './src/nested/.gitignore': `
ignored.ts
        `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const ignoredPath = resolve('./src/ignored.ts');
    const nestedPath = resolve('./src/nested/ignored.ts');
    const { cwd } = paths;

    const suiteSummaryDefer = Promise.withResolvers<BettererSuiteSummary>();

    const runner = await betterer.watch({
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
    await writeFile(ignoredPath, `console.log('foo');`);
    await writeFile(nestedPath, `console.log('foo');`);

    const suiteSummary = await suiteSummaryDefer.promise;
    const [runSummary] = suiteSummary.runSummaries;

    await runner.stop();

    expect(runSummary?.filePaths).toHaveLength(1);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
