import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should fail when the coverage report is invalid', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, testNames, writeFile } = await createFixture('coverage-report-invalid', {
      '.betterer.js': `
import { coverageTotal } from '@betterer/coverage';

export default {
  test: () => coverageTotal()
};    
        `,
      'tsconfig.json': `
{
  "extends": "../../tsconfig.json",
  "include": ["./src/**/*", "./.betterer.js"]
}
      `
    });

    const coverage = `{  
  "total": {
    "lines": { "total": 220, "covered": 110, "skipped": 0, "pct": 50 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 }
  }
}`;

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const coveragePath = resolve('./coverage/coverage-summary.json');

    await writeFile(coveragePath, coverage);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.failed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
