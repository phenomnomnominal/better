import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`actually goes faster with cache`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, testNames } = await createFixture('cache-faster', {
      '.betterer.js': `
import { BettererFileTest } from '@betterer/betterer';
import { promises as fs } from 'node:fs';

export default {
  test: () =>
    new BettererFileTest(async (filePaths, fileTestResult) => {
      await Promise.all(
        filePaths.map(async (filePath) => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const fileContents = await fs.readFile(filePath, "utf8");
          const file = fileTestResult.addFile(filePath, fileContents);
          file.addIssue(1, 2, "Please use TypeScript!");
        })
      );
    })
    .include("**/*.js")
};
    `,
      'src/index.js': ``
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const newStart = new Date().getTime();
    const newTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });
    const newTime = new Date().getTime() - newStart;

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const sameStart = new Date().getTime();
    const sameTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });
    const sameTime = new Date().getTime() - sameStart;

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    expect(sameTime).toBeLessThan(newTime);

    await cleanup();
  });
});
