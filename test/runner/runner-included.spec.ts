import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.runner', () => {
  it('should run the test against an included file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, resolve, cleanup, writeFile } = await createFixture('runner-included', {
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
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url))
      },
    },
  },
  { rules: { 'no-debugger': 'off' } }
);
      `,
      'tsconfig.json': `
{
  "include": ["./src/**/*"]
}      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const { cwd } = paths;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `debugger;`);

    const runner = await betterer.runner({ configPaths, resultsPath, cwd, workers: false });
    await runner.queue(indexPath);

    const contextSummary = await runner.stop();

    const runSuite = contextSummary?.lastSuite;
    const [runSummary] = runSuite?.runSummaries ?? [];

    expect(runSummary?.isNew).toEqual(true);
    expect(runSummary?.filePaths).toEqual([indexPath]);

    await cleanup();
  });
});
