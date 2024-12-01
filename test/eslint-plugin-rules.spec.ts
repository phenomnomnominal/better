import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should handle eslint rule from other plugins', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('eslint-plugin-rules', {
      '.betterer.ts': `
import { eslint } from '@betterer/eslint';

export default {
  test: () => eslint({
    rules: {
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error'
    }
  })
  .include('./src/**/*.ts')
};
      `,
      'eslint.config.js': `
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default tslint.config(
  comments.recommended,
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
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `/* eslint-disable */`);

    await betterer({ configPaths, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
