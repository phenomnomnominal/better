import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should update the cache file in CI mode when the cache is on', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('cache-ci-on', {
      '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};
    `
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `// HACK:\n// HACK:`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    await expect(async () => await readFile(cachePath)).rejects.toThrow();

    const ciTestRun = await betterer({ configPaths, resultsPath, cachePath, ci: true, workers: false });

    expect(testNames(ciTestRun.same)).toEqual(['test']);

    const ciCache = await readFile(cachePath);

    expect(ciCache).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
