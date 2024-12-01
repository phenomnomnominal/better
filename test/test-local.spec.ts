import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should handle importing from local files', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup } = await createFixture('test-local', {
      '.betterer.ts': `
import { shrinks } from './test-ts.ts';
import { grows } from './test-js.js';

export default {
  shrinks,
  grows
}
      `,
      './test-ts.ts': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const count = persist(import.meta.url, 'shrinks', 2);

export const shrinks = () => new BettererTest({
  test: () => count.decrement(),
  constraint: smaller
})
      `,
      './test-js.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const count = persist(import.meta.url, 'grows', 2);

export const grows = () => new BettererTest({
  test: () => count.increment(),
  constraint: bigger
})
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false });

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
