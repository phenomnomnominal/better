import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work with a TS config file that has no extension', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, testNames } = await createFixture('config-no-extension', {
      '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  test: () => new BettererTest({
    test: () => grows.increment(),
    constraint: bigger
  })
};
      `
    });

    const configPaths = [resolve('.betterer')];
    const resultsPath = paths.results;

    const run = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(run.new)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
