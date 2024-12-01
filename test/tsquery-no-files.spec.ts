import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when there are no relevant files for a TSQuery test', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup } = await createFixture('tsquery-no-files', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  tsquery: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
    `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false });

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
