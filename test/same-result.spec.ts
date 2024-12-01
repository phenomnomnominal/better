import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`should work when a test is the same`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, cleanup, testNames } = await createFixture(
      'same-result',
      {
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger, smaller } from '@betterer/constraints';

const start = 0;

export default {
  bigger: () => new BettererTest({
    test: () => start,
    constraint: bigger
  }),
  smaller: () => new BettererTest({
    test: () => start,
    constraint: smaller
  }),
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

    expect(testNames(firstRun.new)).toEqual(['bigger', 'smaller']);

    const secondRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(secondRun.same)).toEqual(['bigger', 'smaller']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
