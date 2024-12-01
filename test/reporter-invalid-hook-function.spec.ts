import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should throw when a hook is not a function', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup, resolve } = await createFixture('reporter-invalid-hook-function', {
      'reporter.js': `
module.exports.reporter = {
    contextStart: ''
};
      `,
      '.betterer.js': ''
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = [resolve('reporter.js')];

    await expect(async () => await betterer({ configPaths, resultsPath, reporters, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
