import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should work with an npm module', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup } = await createFixture('reporter-npm', {
      '.betterer.js': ``
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = ['@betterer/reporter'];

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
