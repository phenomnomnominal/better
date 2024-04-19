import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should escape interpolation characters in the result file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('results-escape', {
      '.betterer.js': `
import { BettererFileTest } from '@betterer/betterer';

function test() {
  return new BettererFileTest((files, fileTestResult) => {
    files.forEach(filePath => {
      const file = fileTestResult.addFile(filePath, '');
      file.addIssue(0, 0, "\`$" + "{key}\`");  
    });
  });
}

export default {
  test: () => test().include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await writeFile(resolve('./src/index.ts'), '');

    // First run to create .betterer.results file:
    await betterer({ configPaths, resultsPath, workers: false });

    // Second run to make sure it doesn't throw when reading results:
    await betterer({ configPaths, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
