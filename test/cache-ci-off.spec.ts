import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should not update the cache file in CI mode when the cache is off', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('cache-ci-off', {
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

    const newTestRun = await betterer({ configPaths, resultsPath, cache: false, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    await expect(async () => await readFile(cachePath)).rejects.toThrow();

    const ciTestRun = await betterer({ configPaths, resultsPath, cache: false, ci: true, workers: false });

    expect(testNames(ciTestRun.same)).toEqual(['test']);

    await expect(async () => await readFile(cachePath)).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
