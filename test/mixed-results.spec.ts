import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when some tests gets worse and others get better', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, readFile, cleanup, testNames } = await createFixture(
      'mixed-results',
      {
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller, bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const shrinks = persist(import.meta.url, 'shrinks', 2);
const grows = persist(import.meta.url, 'grows', 0);

export default {
  'should shrink': () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  }),
  'should grow': () => new BettererTest({
    test: () => grows.decrement(),
    constraint: bigger
  }),
  'should stay the same': () => new BettererTest({
    test: () => 1,
    constraint: bigger
  }),
  'should fail': () => new BettererTest({
    test: () => { throw new Error('throws'); },
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
    const resultsPath = resolve(paths.results);

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.new)).toEqual(['should shrink', 'should grow', 'should stay the same']);
    expect(testNames(firstRun.failed)).toEqual(['should fail']);

    const secondRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(secondRun.better)).toEqual(['should shrink']);
    expect(testNames(secondRun.worse)).toEqual(['should grow']);
    expect(testNames(secondRun.same)).toEqual(['should stay the same']);
    expect(testNames(secondRun.failed)).toEqual(['should fail']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
