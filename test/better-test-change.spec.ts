import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when a test changes and makes the result better', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, testNames } = await createFixture('better-test-change', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"]'
  ).include('./src/**/*.ts')
};  
      `,
      '.betterer.changed.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `,
      'src/index.ts': `
console.log('foo');
console.info('foo');
console.log('foo');
      `
    });
    const resultsPath = paths.results;

    const firstRun = await betterer({ configPaths: [resolve('.betterer.js')], resultsPath, workers: false });

    expect(testNames(firstRun.new)).toEqual(['test']);

    const secondRun = await betterer({ configPaths: [resolve('.betterer.changed.js')], resultsPath, workers: false });

    expect(testNames(secondRun.better)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
