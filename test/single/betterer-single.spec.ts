import { betterer } from '@betterer/betterer';

import { createFixture } from '../fixture';

describe('betterer.single', () => {
  it('should run eslint against a single file', async () => {
    const { paths, resolve, cleanup, writeFile } = await createFixture('test-betterer-eslint-single', {
      '.betterer.js': `
const { eslintBetterer } = require('@betterer/eslint');

module.exports = {
  'eslint enable new rule': eslintBetterer('./src/**/*.ts', ['no-debugger', 'error'])
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
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const { cwd } = paths;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `debugger;`);

    const [run] = await betterer.single({ configPaths, resultsPath, cwd }, indexPath);

    expect(run.isNew).toEqual(true);
    expect(run.files).toEqual([indexPath]);

    await cleanup();
  });

  it('should run regexp against a single file', async () => {
    const { paths, resolve, cleanup, writeFile } = await createFixture('test-betterer-regexp-single', {
      '.betterer.js': `
const { regexpBetterer } = require('@betterer/regexp');

module.exports = {
  'regexp no hack comments': regexpBetterer('./src/**/*.ts', /(\\/\\/\\s*HACK)/i)
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const { cwd } = paths;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `// HACK:`);

    const [run] = await betterer.single({ configPaths, resultsPath, cwd }, indexPath);

    expect(run.isNew).toEqual(true);
    expect(run.files).toEqual([indexPath]);

    await cleanup();
  });

  it('should run tsquery against a single file', async () => {
    const { paths, resolve, cleanup, writeFile } = await createFixture('test-betterer-tsquery-single', {
      '.betterer.ts': `
import { tsqueryBetterer } from '@betterer/tsquery';

export default {
  'tsquery no raw console.log': tsqueryBetterer(
    './tsconfig.json',
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  )
};
      `,
      'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": ["../../node_modules/@types/"],
    "resolveJsonModule": true
  },
  "include": ["./src/**/*", ".betterer.ts"]
}      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const { cwd } = paths;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `console.log('foo');`);

    const [run] = await betterer.single({ configPaths, resultsPath, cwd }, indexPath);

    expect(run.isNew).toEqual(true);
    expect(run.files).toEqual([indexPath]);

    await cleanup();
  });

  it('should run typescript against a single file', async () => {
    const { paths, resolve, cleanup, writeFile } = await createFixture('test-betterer-typescript-single', {
      '.betterer.ts': `
import { typescriptBetterer } from '@betterer/typescript';

export default {
  'typescript use strict mode': typescriptBetterer('./tsconfig.json', {
    strict: true
  })
};
      `,
      'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": ["../../node_modules/@types/"],
    "resolveJsonModule": true
  },
  "include": ["./src/**/*", ".betterer.ts"]
}
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const { cwd } = paths;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `const a = 'a';\nconst one = 1;\nconsole.log(a * one);`);

    const [run] = await betterer.single({ configPaths, resultsPath, cwd }, indexPath);

    expect(run.isNew).toEqual(true);
    expect(run.files).toEqual([indexPath]);

    await cleanup();
  });
});
