import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --silent', () => {
  it('should mute all console output', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup } = await createFixture('silent-mute', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const shrinks = persist(import.meta.url, 'shrinks', 2);
    
export default {
  test: () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  })
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, silent: true, workers: false });

    expect(logs).toHaveLength(0);
    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
