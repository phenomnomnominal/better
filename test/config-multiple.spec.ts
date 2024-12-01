import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work with multiple .betterer.ts files', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, resolve, cleanup, testNames } = await createFixture('config-multiple', {
      'grows.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  grows: () => new BettererTest({
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
  shrinks: () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  })
};
      `
    });

    const configPaths = [resolve('grows.betterer.ts'), resolve('shrinks.betterer.ts')];
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.new)).toEqual(['grows', 'shrinks']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
