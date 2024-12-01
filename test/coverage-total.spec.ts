import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the total coverage', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, readFile, testNames, writeFile } = await createFixture('coverage-total', {
      '.betterer.js': `
import { coverageTotal } from '@betterer/coverage';

export default {
  test: () => coverageTotal('./my-report/coverage.json')
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
    const coveragePath = resolve('./my-report/coverage.json');

    await writeFile(coveragePath, coverage);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    const sameTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    const betterCoverage = `
{
  "total": {
    "lines": { "total": 220, "covered": 210, "skipped": 0, "pct": 95.4 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 },
    "branches": { "total": 300, "covered": 100, "skipped": 0, "pct": 33.3 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 100, "skipped": 0, "pct": 100 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 110, "skipped": 0, "pct": 91.6 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, betterCoverage);

    const betterTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['test']);

    const worseCoverage = `
{
  "total": {
    "lines": { "total": 220, "covered": 210, "skipped": 0, "pct": 95.4 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 },
    "branches": { "total": 300, "covered": 90, "skipped": 0, "pct": 30 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 100, "skipped": 0, "pct": 100 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 40, "skipped": 0, "pct": 26.6 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 110, "skipped": 0, "pct": 91.6 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, worseCoverage);

    const worseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
