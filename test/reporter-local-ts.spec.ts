import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should work with a local TypeScript module', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, resolve } = await createFixture('reporter-local-ts', {
      'reporter.ts': `
        import { BettererReporter } from '@betterer/betterer';
        import { reporter as actual } from './actual-reporter.ts';

        export const reporter: BettererReporter = actual;
      `,
      'actual-reporter.ts': `
        import type { BettererReporter } from '@betterer/betterer';

        export const reporter: BettererReporter = {};
      `,
      '.betterer.js': ``
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = [resolve('reporter.ts')];

    let throws = false;
    try {
      await betterer({ configPaths, resultsPath, reporters, workers: false });
    } catch {
      throws = true;
    }

    expect(throws).toBe(false);

    await cleanup();
  });
});
