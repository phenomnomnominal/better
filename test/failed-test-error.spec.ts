import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`should work when a test fails`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup, testNames } = await createFixture('failed-test-error', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';

export default {
  test: () => new BettererTest({
    test: () => {
      throw new Error('OH NO!');
    },
    constraint: bigger
  })
};
`
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.failed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
