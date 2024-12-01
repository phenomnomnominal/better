import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should work with a local module', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, resolve } = await createFixture('reporter-local', {
      'reporter.js': `
        module.exports.reporter = {};
      `,
      '.betterer.js': ``
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = [resolve('reporter.js')];

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
