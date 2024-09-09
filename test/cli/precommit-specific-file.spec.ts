import { describe, it, expect } from 'vitest';

import { simpleGit } from 'simple-git';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer precommit', () => {
  it('should test just the specified files', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { paths, logs, cleanup, resolve, readFile, writeFile } = await createFixture('precommit-specific-file', {
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
  "extends": "../../tsconfig.json",
  "include": ["./src/**/*", "./.betterer.js", "./.eslintrc.js"]
}
      `,
      './src/existing-file-1.ts': `
debugger;
      `,
      './src/existing-file-2.ts': `
debugger;
      `
    });

    const fixturePath = paths.cwd;
    const resultsPath = paths.results;

    const newFilePath = resolve('./src/new-file.ts');

    process.env.BETTERER_WORKER = 'false';

    await writeFile(newFilePath, 'debugger;');

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    await cliΔ(fixturePath, [...ARGV, 'precommit', '--workers=false', newFilePath], false);

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    const git = simpleGit();
    const status = await git.status([paths.results]);
    const [stagedResultsPath] = status.staged;
    expect(stagedResultsPath).toMatchSnapshot();

    await git.reset([resultsPath]);

    await cleanup();
  });
});
