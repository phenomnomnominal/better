import { describe, it, expect } from 'vitest';

import { simpleGit } from 'simple-git';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer precommit', () => {
  it('should not update the changeset when a test gets worse', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { paths, logs, cleanup, resolve, writeFile } = await createFixture('precommit-worse', {
      'src/index.ts': `
const a = 'a';
const one = 1;
console.log(a * one);
      `,
      '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  test: () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts')
};    
      `,
      'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext", "dom"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": [],
    "resolveJsonModule": true
  },
  "include": ["./src/**/*"]
}
      `
    });

    const fixturePath = paths.cwd;
    const indexPath = resolve('./src/index.ts');

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    await writeFile(indexPath, `const a = 'a';\nconst one = 1;\nconsole.log(one * a);\nconsole.log(a * one);`);

    await expect(async () => {
      await cliΔ(fixturePath, [...ARGV, 'precommit', '--workers=false', '--repoPath=../../']);
    }).rejects.toThrow('Tests got worse while running in precommit mode. ❌');

    expect(logs).toMatchSnapshot();

    const git = simpleGit();
    const status = await git.status([paths.results]);
    expect(status.staged).toEqual([]);

    await cleanup();
  });
});
