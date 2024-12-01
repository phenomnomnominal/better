import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the existence of RegExp matches, with a custom issue message', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture(
      'regexp-with-issue-message',
      {
        '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  'regexp': () => regexp(/(\\/\\/\\s*HACK)/i, "no hacks here!").include('./src/**/*.ts')
};
    `
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `// HACK:`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['regexp']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
