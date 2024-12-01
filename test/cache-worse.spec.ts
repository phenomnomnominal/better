import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`doesn't cache if a test gets worse`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('cache-worse', {
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

    await writeFile(indexPath, `// HACK:`);

    const newTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const newCache = await readFile(cachePath);

    expect(newCache).toMatchSnapshot();

    const sameTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    const sameCache = await readFile(cachePath);

    expect(sameCache).toMatchSnapshot();

    await writeFile(indexPath, `// HACK:\n// HACK:`);

    const worseTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['test']);

    const worseCache = await readFile(cachePath);

    expect(worseCache).toEqual(sameCache);

    const stillWorseTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(stillWorseTestRun.worse)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
