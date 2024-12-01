import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it(`shouldn't actually run the compiler when there are no valid files`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup } = await createFixture('angular-no-valid-files', {
      '.betterer.ts': `
import { angular } from '@betterer/angular';

export default {
  test: () => angular('./tsconfig.json', {
    strictTemplates: true
  }).include('./invalid-include')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    const [completed] = newTestRun.completed;
    expect(completed.filePaths).toHaveLength(0);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
