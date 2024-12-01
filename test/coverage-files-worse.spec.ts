import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report a worse file coverage result', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, testNames, writeFile } = await createFixture('coverage-files-worse', {
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
    const file3Path = resolve('./src/file-3.ts');

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

    // file-1 is worse
    const worseCoverage = `
{  
  "total": {
    "lines": { "total": 220, "covered": 100, "skipped": 0, "pct": 45.4 },
    "statements": { "total": 410, "covered": 140, "skipped": 0, "pct": 34.1 },
    "functions": { "total": 30, "covered": 11, "skipped": 0, "pct": 36.6 },
    "branches": { "total": 300, "covered": 100, "skipped": 0, "pct": 33.3 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 40, "skipped": 0, "pct": 40 },
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

    await writeFile(coveragePath, worseCoverage);

    const worseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['test']);

    // file-1 is better, but file-2 is worse
    const stillWorseCoverage = `
{
  "total": {
    "lines": { "total": 220, "covered": 90, "skipped": 0, "pct": 40.9 },
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
    "lines": { "total": 120, "covered": 30, "skipped": 0, "pct": 25 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, stillWorseCoverage);

    const stillWorseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(stillWorseTestRun.worse)).toEqual(['test']);

    // file-3 is added but it is not 100% covered
    const evenWorseCoverage = `
{  
  "total": {
    "lines": { "total": 320, "covered": 150, "skipped": 0, "pct": 46.8 },
    "statements": { "total": 610, "covered": 210, "skipped": 0, "pct": 34.4 },
    "functions": { "total": 50, "covered": 16, "skipped": 0, "pct": 32 },
    "branches": { "total": 450, "covered": 150, "skipped": 0, "pct": 33.3 }
  },
  "${file1Path}": {
    "lines": { "total": 100, "covered": 60, "skipped": 0, "pct": 60 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file2Path}": {
    "lines": { "total": 120, "covered": 30, "skipped": 0, "pct": 25 },
    "statements": { "total": 210, "covered": 70, "skipped": 0, "pct": 33.3 },
    "functions": { "total": 10, "covered": 6, "skipped": 0, "pct": 60 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  },
  "${file3Path}": {
    "lines": { "total": 100, "covered": 60, "skipped": 0, "pct": 60 },
    "statements": { "total": 200, "covered": 70, "skipped": 0, "pct": 35 },
    "functions": { "total": 20, "covered": 5, "skipped": 0, "pct": 25 },
    "branches": { "total": 150, "covered": 50, "skipped": 0, "pct": 33.3 }
  }
}
    `;

    await writeFile(coveragePath, evenWorseCoverage);

    const evenWorseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(evenWorseTestRun.worse)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
