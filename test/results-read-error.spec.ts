import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should throw when reading the results file fails', async () => {
    const { betterer, runner } = await import('@betterer/betterer');

    const { logs, paths, cleanup, resolve, writeFile } = await createFixture('results-read-error', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export default {
  test: () => new BettererTest({
    test: () => grows.increment(),
    constraint: smaller
  })
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(resultsPath, 'throw new Error()');

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();
    await expect(async () => {
      const throwRunner = await runner({ configPaths, resultsPath, workers: false });
      await throwRunner.queue([indexPath]);
      await throwRunner.stop();
    }).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
