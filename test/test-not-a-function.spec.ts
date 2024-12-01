import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should throw if a test is not a function', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup } = await createFixture('test-not-a-function', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const shrinks = persist(import.meta.url, 'shrinks', 2);

export default {
  test: new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  })
}
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
