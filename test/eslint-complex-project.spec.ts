import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the status of a new eslint rule with a complex set up', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture(
      'eslint-complex-project',
      {
        '.betterer.ts': `
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
        'eslint.base.config.js': `
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
        'eslint.config.js': `
import config from './eslint.base.config.js';

export default [...config, {
  rules: {
    '@typescript-eslint/prefer-string-starts-ends-with': 'error'
  }
}];
            `,
        'tsconfig.json': `
{
  "include": ["./src/**/*"]
}
      `,

        'src/directory/index.ts': `
export const result = 'hello'[0] === 'h';

export enum Numbers {
  one,
  two,
  three,
  four
}
      `
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const deepIndexPath = resolve('./src/directory/index.ts');

    await writeFile(indexPath, `debugger;`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['test']);

    const sameTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['test']);

    await writeFile(indexPath, `debugger;\ndebugger;`);

    const worseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['test']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, ``);
    await writeFile(
      deepIndexPath,
      `export const result = 'hello'.startsWith('h');\n\nexport enum Numbers {\n  one,\n  two,\n  three,\n  four\n}`
    );

    const betterTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['test']);

    const completedTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(completedTestRun.completed)).toEqual(['test']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
