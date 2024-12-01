import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it('should quit when "q" is pressed', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup, resolve, sendKeys, writeFile } = await createFixture('watch-quit', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    const { cwd } = paths;

    const suiteEndDefer = Promise.withResolvers<void>();
    const contextEndDefer = Promise.withResolvers<void>();

    await betterer.watch({
      configPaths,
      resultsPath,
      cwd,
      reporters: [
        '@betterer/reporter',
        {
          suiteEnd() {
            suiteEndDefer.resolve();
          },
          contextEnd() {
            contextEndDefer.resolve();
          }
        }
      ],
      workers: false
    });

    await writeFile(indexPath, `console.log('foo');console.log('foo');`);

    await suiteEndDefer.promise;

    // Press "q" to quit watch mode:
    await sendKeys('q');

    await contextEndDefer.promise;

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
