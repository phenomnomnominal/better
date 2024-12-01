import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

const isNode16 = process.version.startsWith('v16');

describe('betterer.watch', () => {
  it.skipIf(!process.stdout.isTTY || isNode16)('should show an error for an invalid filter in watch mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, resolve, cleanup, writeFile, sendKeys } = await createFixture('watch-filter-error', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return tsquery(
      'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
    ).include('./src/**/*.ts')
  },
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const { cwd } = paths;

    await writeFile(indexPath, `console.log('foo');`);

    await betterer({ configPaths, resultsPath, cwd, workers: false });

    const runner = await betterer.watch({
      configPaths,
      resultsPath,
      cwd,
      reporters: ['@betterer/reporter'],
      strict: false,
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');debugger;`);

    // Press "f" to enter filter mode:
    await sendKeys('f');

    // Press "(" which is an invalid filter:
    await sendKeys('(');

    // Press "Enter" which shouldn't work:
    await sendKeys('\r');

    await runner.stop();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
