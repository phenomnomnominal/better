import { createFixture } from './fixture';

describe('betterer --reporter', () => {
  it('should work with a local TypeScript module', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, resolve } = await createFixture('reporter-local-ts', {
      'reporter.ts': `
        export const reporter = {};
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
