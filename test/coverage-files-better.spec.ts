import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report an improved file coverage result', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, testNames, writeFile } = await createFixture('coverage-files-better', {
      '.betterer.js': `
import { coverage } from '@betterer/coverage';

export default {
  test: () => coverage()
};    
        `,
      'tsconfig.json': `
{
  "extends": "../../tsconfig.json",
  "include": ["./src/**/*", "./.betterer.js"]
}
      `
    });

    const file1Path = resolve('./src/file-1.ts');
    const file2Path = resolve('./src/file-2.ts');

    const coverage = `
{
  "total": {
    "lines": { "total": 220, "covered": 110, "skipped": 0, "pct": 50 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 },
    "branches": { "total": 300, "covered": 100, "skipped": 0, "pct": 33.3 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 50, "skipped": 0, "pct": 50 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 60, "skipped": 0, "pct": 50 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const coveragePath = resolve('./coverage/coverage-summary.json');

    await writeFile(coveragePath, coverage);

    await betterer({ configPaths, resultsPath, workers: false });

    // file-1 is better
    const betterCoverage = `
{
  "total": {
    "lines": { "total": 220, "covered": 120, "skipped": 0, "pct": 54.54 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 },
    "branches": { "total": 300, "covered": 100, "skipped": 0, "pct": 33.3 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 60, "skipped": 0, "pct": 60 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 60, "skipped": 0, "pct": 50 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, betterCoverage);

    const betterTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['test']);

    // file-1 is gone
    const evenBetterCoverage = `
{
  "total": {
    "lines": { "total": 120, "covered": 60, "skipped": 0, "pct": 50 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 60, "skipped": 0, "pct": 50 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, evenBetterCoverage);

    const evenBetterTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(evenBetterTestRun.better)).toEqual(['test']);

    // file-2 is fully covered
    const completedCoverage = `{
  "total": {
    "lines": { "total": 120, "covered": 120, "skipped": 0, "pct": 100 },
    "statements": { "total": 210, "covered": 210, "skipped": 0, "pct": 100 },
    "functions": { "total": 10, "covered": 10, "skipped": 0, "pct": 100 },
    "branches": { "total": 150, "covered": 150, "skipped": 0, "pct": 100 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 120, "skipped": 0, "pct": 100 },
    "statements": { "total": 210, "covered": 210, "skipped": 0, "pct": 100 },
    "functions": { "total": 10, "covered": 10, "skipped": 0, "pct": 100 },
    "branches": { "total": 150, "covered": 150, "skipped": 0, "pct": 100 }
  }
}`;

    await writeFile(coveragePath, completedCoverage);

    const completedTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(completedTestRun.completed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
