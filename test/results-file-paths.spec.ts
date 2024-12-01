import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should remove the version control path from issue messages', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('results-files-paths', {
      '.betterer.ts': `
import { BettererFileTest } from '@betterer/betterer';
import path from 'node:path';

function test(): BettererFileTest {
  return new BettererFileTest((files, fileTestResult) => {
    files.forEach(filePath => {
      const file = fileTestResult.addFile(filePath, '');
      file.addIssue(0, 0, \`some error found in \${filePath} oh no\`);
      file.addIssue(0, 0, \`some error found in ../../some/file/path and ..\\\\..\\\\some\\\\other\\\\file\\\\path oh no\`);
      file.addIssue(0, 0, \`some error found in '\${filePath}' oh no\`);
      file.addIssue(0, 0, \`some error found in [../../some/file/path] and "..\\\\..\\\\some\\\\other\\\\file\\\\path" oh no\`);
      file.addIssue(0, 0, \`some error found in \\\`\${filePath}\\\` oh no\`);
      file.addIssue(0, 0, \`some error found in (../../some/file/path) and {..\\\\..\\\\some\\\\other\\\\file\\\\path} oh no\`);
      file.addIssue(0, 0, \`some error found in <\${filePath}> oh no\`);
    });
  });
}

export default {
  test: () => test().include('./src/**/*.ts')
};
      `,
      './src/another-file.ts': ''
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
