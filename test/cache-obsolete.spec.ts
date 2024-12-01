import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should hold onto the cache for an obsolete test until it is removed', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('cache-obsolete', {
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

    const newTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const newCache = await readFile(cachePath);

    expect(newCache).toMatchSnapshot();

    await writeFile(indexPath, ``);

    const completedTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(completedTestRun.completed)).toEqual(['test']);

    const completedCache = await readFile(cachePath);

    expect(completedCache).toMatchSnapshot();

    await writeFile(paths.config, 'export default {}');

    const obsoleteTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(obsoleteTestRun.obsolete)).toEqual(['test']);

    const obsoleteCache = await readFile(cachePath);

    expect(obsoleteCache).toMatchSnapshot();

    const removedTestRun = await betterer({ configPaths, resultsPath, cachePath, update: true, workers: false });

    expect(testNames(removedTestRun.removed)).toEqual(['test']);

    const removedCache = await readFile(cachePath);

    expect(removedCache).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
