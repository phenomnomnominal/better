import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it(`should make a test as complete when it reaches its goal`, async () => {
    const { logs, paths, readFile, cleanup, runNames } = await createFixture(
      'complete',
      {
        '.betterer.js': `
const { BettererTest } = require('@betterer/betterer');
const { bigger } = require('@betterer/constraints');
const { persist } = require('@betterer/fixture');

const grows = persist(__dirname, 'grows', 0);

module.exports = {
  'should complete': () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger,
    goal: (result) => result >= 2
  }),
  'complete': () => new BettererTest({
    test: () => 0,
    constraint: bigger,
    goal: 0
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

    const firstRun = await betterer({ configPaths, resultsPath, workers: 1 });

    expect(runNames(firstRun.new)).toEqual(['should complete', 'complete']);
    expect(runNames(firstRun.completed)).toEqual(['complete']);

    const secondRun = await betterer({ configPaths, resultsPath, workers: 1 });

    expect(runNames(secondRun.better)).toEqual(['should complete']);

    const thirdRun = await betterer({ configPaths, resultsPath, workers: 1 });

    expect(runNames(thirdRun.completed)).toEqual(['should complete', 'complete']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
