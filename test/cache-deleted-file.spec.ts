import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should remove files from the cache when they are deleted', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, deleteFile, testNames } = await createFixture(
      'cache-deleted-file',
      {
        '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
    `
      }
    );

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const file1Path = resolve('./src/file-1.ts');
    const file2Path = resolve('./src/file-2.ts');

    await writeFile(file1Path, `// HACK:\n// HACK:`);
    await writeFile(file2Path, `// HACK:\n// HACK:`);

    const newTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const newCache = await readFile(cachePath);

    expect(newCache).toMatchSnapshot();

    await deleteFile(file2Path);

    const file2DeletedTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(file2DeletedTestRun.better)).toEqual(['test']);

    const file2DeletedCache = await readFile(cachePath);

    expect(file2DeletedCache).toMatchSnapshot();

    const file2DeletedResult = await readFile(resultsPath);

    expect(file2DeletedResult).toMatchSnapshot();

    await writeFile(file2Path, `// HACK:\n// HACK:`);

    const file2RestoredTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });

    expect(testNames(file2RestoredTestRun.worse)).toEqual(['test']);

    const file2RestoredCache = await readFile(cachePath);

    expect(file2RestoredCache).toMatchSnapshot();

    const file2RestoredResult = await readFile(resultsPath);

    expect(file2RestoredResult).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
