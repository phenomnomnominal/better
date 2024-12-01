import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should write a cache file to a different path', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('cache-path', {
      '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};
    `
    });

    const cachePath = resolve('./betterer/.betterer.cache');
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `// HACK:\n// HACK:`);

    const newTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const newCache = await readFile(cachePath);

    expect(newCache).toMatchSnapshot();

    const sameTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    await writeFile(indexPath, `// HACK:\n// HACK:\n// HACK:`);

    const worseTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['test']);

    const worseCache = await readFile(cachePath);

    expect(worseCache).toMatchSnapshot();

    const worseResult = await readFile(resultsPath);

    expect(worseResult).toMatchSnapshot();

    await writeFile(indexPath, `// HACK:`);

    const betterTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['test']);

    const betterCache = await readFile(cachePath);

    expect(betterCache).toMatchSnapshot();

    const betterResult = await readFile(resultsPath);

    expect(betterResult).toMatchSnapshot();

    await writeFile(indexPath, ``);

    const completedTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(completedTestRun.completed)).toEqual(['test']);

    const completedCache = await readFile(cachePath);

    expect(completedCache).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
