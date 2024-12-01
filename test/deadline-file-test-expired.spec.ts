import { describe, expect, it, vitest } from 'vitest';

import { createFixture } from './fixture.js';

vitest.resetModules();
vitest.mock('@betterer/time', async (importOriginal): Promise<typeof import('@betterer/time')> => {
  const time: typeof import('@betterer/time') = await importOriginal();
  return {
    ...time,
    getPreciseTimeΔ: () => 0,
    getTimeΔ: () => Date.now()
  };
});

describe('betterer', () => {
  it('should mark a file test as expired when it is past its deadline', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, testNames } = await createFixture('deadline-file-test-expired', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts').deadline('0')
};
    `,
      'src/index.ts': `
console.log('foo')
    `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.expired)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
