import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it('should sort files by their file path even when only running on a single file', async () => {
    const { paths, logs, cleanup, resolve, runNames, readFile, writeFile } = await createFixture(
      'file-test-sort-subset',
      {
        '.betterer.js': `
const { eslint } = require('@betterer/eslint');

module.exports = {
  test: () => eslint({ 'no-debugger': 'error' }).include('./src/**/*.ts')
};
      `,
        '.eslintrc.js': `
const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    project: path.resolve(__dirname, './tsconfig.json'),
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    'no-debugger': 1
  }
};
    `,
        'tsconfig.json': `
{
  "extends": "../../tsconfig.json",
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

    const firstRun = await betterer({ configPaths, resultsPath, workers: 1 });
    expect(runNames(firstRun.ran)).toEqual(['test']);

    await writeFile(resolve('./src/c.ts'), `debugger;\ndebugger;\ndebugger;`);

    const secondRun = await betterer({ configPaths, resultsPath, includes: ['src/c.ts'], update: true, workers: 1 });
    expect(runNames(secondRun.ran)).toEqual(['test']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();
    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
