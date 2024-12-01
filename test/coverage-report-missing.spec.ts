import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should fail when the coverage report is missing', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, testNames } = await createFixture('coverage-report-missing', {
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

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.failed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
