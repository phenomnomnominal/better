import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it(`actually makes shit faster`, async () => {
    const { paths, cleanup, runNames } = await createFixture('cache-faster', {
      '.betterer.js': `
const { BettererFileTest } = require('@betterer/betterer');
const { promises: fs } = require('fs');

module.exports = {
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

    expect(runNames(newTestRun.new)).toEqual(['test']);

    const sameStart = new Date().getTime();
    const sameTestRun = await betterer({ configPaths, resultsPath, cachePath, workers: false });
    const sameTime = new Date().getTime() - sameStart;

    expect(runNames(sameTestRun.same)).toEqual(['test']);

    expect(sameTime).toBeLessThan(newTime);

    await cleanup();
  });
});
