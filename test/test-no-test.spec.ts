import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it('should throw if there is no test', async () => {
    const { paths, logs, cleanup } = await createFixture('test-no-test', {
      '.betterer.js': `
  const { BettererTest } = require('@betterer/betterer');
  const { smaller } = require('@betterer/constraints');

  module.exports = {
    test: () => new BettererTest({
      constraint: smaller
    })
  };      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
