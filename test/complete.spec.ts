import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`should mark a test as complete when it reaches its goal`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, testNames } = await createFixture(
      'complete',
      {
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const shouldComplete = persist(import.meta.url, 'should-complete', 0);
const shouldCompleteTheGetWorse = persist(import.meta.url, 'should complete then get worse', 0);

export default {
  'should complete': () => new BettererTest({
    test: () => shouldComplete.increment(),
    constraint: bigger,
    goal: (result) => result >= 2
  }),
  'complete': () => new BettererTest({
    test: () => 0,
    constraint: bigger,
    goal: 0
  }),
  'should complete then get worse': () => new BettererTest({
    test: async () => {
      const result = await shouldCompleteTheGetWorse.increment();
      if (result > 2) {
        await shouldCompleteTheGetWorse.reset();
      }
      return result;
    },
    constraint: bigger,
    goal: (result) => result >= 2
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

    expect(testNames(firstRun.new)).toEqual(['should complete', 'should complete then get worse']);
    expect(testNames(firstRun.completed)).toEqual(['complete']);

    const firstResult = await readFile(resultsPath);

    expect(firstResult).toMatchSnapshot();

    const secondRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(secondRun.better)).toEqual(['should complete', 'should complete then get worse']);

    const secondResult = await readFile(resultsPath);

    expect(secondResult).toMatchSnapshot();

    const thirdRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(thirdRun.completed)).toEqual(['should complete', 'complete', 'should complete then get worse']);

    const thirdResult = await readFile(resultsPath);

    expect(thirdResult).toMatchSnapshot();

    const fourthRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(fourthRun.completed)).toEqual(['should complete', 'complete']);
    expect(testNames(fourthRun.worse)).toEqual(['should complete then get worse']);

    expect(logs).toMatchSnapshot();

    const fourthResult = await readFile(resultsPath);

    expect(fourthResult).toMatchSnapshot();

    await cleanup();
  });
});
