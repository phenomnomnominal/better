import { describe, expect, it, vitest } from 'vitest';

import { createFixture } from './fixture.js';

vitest.resetModules();
vitest.mock('@betterer/time', async (importOriginal): Promise<typeof import('@betterer/time')> => {
  const time: typeof import('@betterer/time') = await importOriginal();
  return {
    ...time,
    getPreciseTimeΔ: () => 0,
    getTimeΔ: () => 1589714460851
  };
});

describe('betterer', () => {
  it('should do nothing when a test is not past its deadline', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, testNames } = await createFixture('deadline-future', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  test: () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger,
    goal: 5,
    deadline: new Date()
  })
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.expired)).toEqual([]);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
