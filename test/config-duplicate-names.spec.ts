import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work with multiple .betterer.ts files', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup } = await createFixture('config-multiple', {
      'grows.betterer.ts': `
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
      `,
      'shrinks.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const shrinks = persist(import.meta.url, 'shrinks', 0);

export default {
  test: () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  })
};
      `
    });

    const configPaths = [resolve('grows.betterer.ts'), resolve('shrinks.betterer.ts')];
    const resultsPath = paths.results;

    await expect(
      async () => await betterer({ configPaths, logo: true, resultsPath, workers: false })
    ).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
