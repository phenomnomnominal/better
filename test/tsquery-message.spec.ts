import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should include custom TSQuery warning messages', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('tsquery', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  tsquery: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]',
    'no console logs here'
  ).include('./src/**/*.ts')
};
    `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `console.log('foo');`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['tsquery']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
