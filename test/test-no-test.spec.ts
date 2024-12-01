import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should throw if there is no test', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup } = await createFixture('test-no-test', {
      '.betterer.js': `
  import { BettererTest } from '@betterer/betterer';
  import { smaller } from '@betterer/constraints';

  export default {
    test: () => new BettererTest({
      constraint: smaller
    })
  };      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
