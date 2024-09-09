import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should sort files by their file path even when only running on a single file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, testNames, readFile, writeFile } = await createFixture(
      'file-test-sort-subset',
      {
        '.betterer.js': `
import { eslint } from '@betterer/eslint';

export default {
  test: () => eslint({ 
      rules: { 
        'no-debugger': 'error'
      }
    })
    .include('./src/**/*.ts')
};
      `,
        'eslint.config.js': `
import config from '../../eslint.config.js';

export default [
  ...config,
  {
    ignores: ['!fixtures/**']
  },
  { rules: { 'no-debugger': 'off' } }
];
      `,
        'tsconfig.json': `
{
  "extends": "../../tsconfig.spec.json",
  "include": ["./src/**/*", "./.betterer.js", "./.eslintrc.js"]
}
        `
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await writeFile(resolve('./src/a.ts'), `debugger;\ndebugger;`);
    await writeFile(resolve('./src/d.ts'), `debugger;\ndebugger;`);
    await writeFile(resolve('./src/b.ts'), `debugger;\ndebugger;`);
    await writeFile(resolve('./src/c.ts'), `debugger;\ndebugger;`);

    const firstRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(firstRun.ran)).toEqual(['test']);

    await writeFile(resolve('./src/c.ts'), `debugger;\ndebugger;\ndebugger;`);

    const secondRun = await betterer({
      configPaths,
      resultsPath,
      includes: ['src/c.ts'],
      update: true,
      workers: false
    });

    expect(testNames(secondRun.ran)).toEqual(['test']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();
    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
