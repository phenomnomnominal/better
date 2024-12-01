import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should report the current results for a test', async () => {
    const { logs, paths, cleanup } = await createFixture('results-test', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller, bigger } from '@betterer/constraints';
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

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const fixturePath = paths.cwd;

    const { betterer } = await import('@betterer/betterer');

    await betterer({ configPaths, resultsPath, workers: false, silent: true });

    const { cliΔ } = await import('@betterer/cli');

    await cliΔ(fixturePath, [...ARGV, 'results']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
