import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  // See: https://github.com/phenomnomnominal/betterer/issues/1202
  it('should handle eslint rules that mark the entire line of code', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('eslint-no-column-rule', {
      '.betterer.ts': `
import { eslint } from '@betterer/eslint';

export default {
  test: () => eslint({
    rules: {
      '@eslint-community/eslint-comments/require-description': 'error'
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
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  comments.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url))
      },
    },
  },
  { rules: { '@eslint-community/eslint-comments/require-description': 'off' } }
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

    await writeFile(indexPath, `// eslint-disable-next-line\ndebugger;`);

    await betterer({ configPaths, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
