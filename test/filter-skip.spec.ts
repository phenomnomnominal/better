import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should not run a specific test called with skip()', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture(
      'filter-skip',
      {
        '.betterer.skip.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { regexp } from '@betterer/regexp';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  'test 1': () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger
  }).skip(),
  'test 2': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts').skip()
};
      `,
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { regexp } from '@betterer/regexp';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  'test 1': () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger
  }),
  'test 2': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};
      `
      },
      {
        logFilters: [/: running /, /running.../]
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `// HACK:`);

    const run = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(run.ran)).toEqual(['test 1', 'test 2']);
    expect(testNames(run.skipped)).toEqual([]);

    const skipRun = await betterer({
      configPaths: [resolve('./.betterer.skip.ts')],
      resultsPath,
      workers: false
    });

    expect(testNames(skipRun.ran)).toEqual([]);
    expect(testNames(skipRun.skipped)).toEqual(['test 1', 'test 2']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
