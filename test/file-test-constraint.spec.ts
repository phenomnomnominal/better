import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should let you override the constraint of a file test', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup, resolve, testNames, readFile, writeFile } = await createFixture(
      'file-test-constraint',
      {
        '.betterer.js': `
import { eslint } from '@betterer/eslint';
import { BettererConstraintResult } from '@betterer/constraints';

export default {
  test: () => eslint({ 
      rules: { 
        'no-debugger': 'error'
      }
    })
    .include('./src/**/*.ts')
    .constraint(() => BettererConstraintResult.same)
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
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `debugger;\ndebugger;`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    await writeFile(indexPath, `debugger;\ndebugger;\ndebugger;`);

    const sameTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();
    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
