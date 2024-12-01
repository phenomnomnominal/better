import { describe, it, expect } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when a result gets better', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, testNames } = await createFixture(
      'better-result',
      {
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller, bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);
const shrinks = persist(import.meta.url, 'shrinks', 2);

export default {
  'should shrink': () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  }),
  'should grow': () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger
  })
};
      `
      },
      {
        logFilters: [/: running /, /running.../]
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.new)).toEqual(['should shrink', 'should grow']);

    const secondRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(secondRun.better)).toEqual(['should shrink', 'should grow']);

    const [betterSummary] = secondRun.better;
    expect(betterSummary.diff).toBeDefined();

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
