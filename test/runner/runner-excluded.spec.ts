import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.runner', () => {
  it(`should ignore any files that aren't included in the test`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, resolve, cleanup, writeFile } = await createFixture('runner-excluded', {
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
    const testPath = resolve('./test/index.ts');

    await writeFile(testPath, `debugger;`);

    const runner = await betterer.runner({ configPaths, resultsPath, cwd, workers: false });
    await runner.queue(testPath);

    const contextSummary = await runner.stop();

    const runSuite = contextSummary?.lastSuite;
    const [runSummary] = runSuite?.runSummaries ?? [];

    expect(runSummary?.isComplete).toEqual(true);
    expect(runSummary?.filePaths).toHaveLength(0);

    await cleanup();
  });
});
