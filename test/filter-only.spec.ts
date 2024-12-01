import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should run only specific tests called with only()', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture(
      'filter-only',
      {
        '.betterer.only.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { regexp } from '@betterer/regexp';

export default {
  'test 1': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }).only(),
  'test 2': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 3': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 4': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts').only()
};
        `,
        '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { regexp } from '@betterer/regexp';

export default {
  'test 1': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 2': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 3': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 4': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
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

    expect(testNames(run.ran)).toEqual(['test 1', 'test 2', 'test 3', 'test 4']);
    expect(testNames(run.skipped)).toEqual([]);

    const onlyRun = await betterer({
      configPaths: [resolve('./.betterer.only.ts')],
      resultsPath,
      workers: false
    });

    expect(testNames(onlyRun.ran)).toEqual(['test 1', 'test 4']);
    expect(testNames(onlyRun.skipped)).toEqual(['test 2', 'test 3']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
