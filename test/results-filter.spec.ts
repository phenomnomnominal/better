import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should return only the current results for a filtered test', async () => {
    const { betterer, results } = await import('@betterer/betterer');

    const { paths, cleanup } = await createFixture('results-filter', {
      '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  'test 1': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts'),
  'test 2': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts'),
  'test 3': () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
    `,
      'src/file-with-issue.ts': `
// HACK:
    `,
      'src/file-with-issues.ts': `
// HACK:
// HACK:
    `,
      'src/file-with-no-issues.ts': ``
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false, silent: true });

    const resultsSummary = await results({ configPaths, resultsPath, filters: [/test 1/] });

    const test1ResultSummary = resultsSummary.resultSummaries.find((resultSummary) => resultSummary.name === 'test 1');

    expect(test1ResultSummary).toBeDefined();
    expect(test1ResultSummary?.isFileTest).toEqual(true);
    expect(test1ResultSummary?.isFileTest && test1ResultSummary.details).toBeDefined();

    const test2ResultSummary = resultsSummary.resultSummaries.find((resultSummary) => resultSummary.name === 'test 2');
    expect(test2ResultSummary).not.toBeDefined();

    const test3ResultSummary = resultsSummary.resultSummaries.find((resultSummary) => resultSummary.name === 'test 3');
    expect(test3ResultSummary).not.toBeDefined();

    await cleanup();
  });
});
