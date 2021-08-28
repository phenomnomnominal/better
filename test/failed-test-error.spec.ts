import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it(`should work when a test fails`, async () => {
    const { logs, paths, cleanup, runNames } = await createFixture('failed-test-error', {
      '.betterer.js': `
const { BettererTest } = require('@betterer/betterer');
const { bigger } = require('@betterer/constraints');

module.exports = {
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

    expect(runNames(firstRun.failed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
