import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should run tests in workers', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture(
      'workers',
      {
        '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger, smaller } from '@betterer/constraints';
import { regexp } from '@betterer/regexp';
import { tsquery } from '@betterer/tsquery';

export default {
  'test 1': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 2': () => new BettererTest({
    test: () => 0,
    constraint: smaller
  }),
  'test 3': () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts'),
  'test 4': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};
        `,
        './src/index.ts': `
// HACK:
console.log('foo');
        `
      },
      {
        logFilters: [/: running /, /running.../]
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    const newRun = await betterer({ configPaths, resultsPath, workers: true });

    expect(testNames(newRun.ran)).toEqual(['test 1', 'test 2', 'test 3', 'test 4']);

    await writeFile(indexPath, `// HACK\n// HACK`);

    const betterRun = await betterer({ configPaths, resultsPath, workers: true });

    expect(testNames(betterRun.same)).toEqual(['test 1', 'test 2']);
    expect(testNames(betterRun.better)).toEqual(['test 3']);
    expect(testNames(betterRun.worse)).toEqual(['test 4']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
