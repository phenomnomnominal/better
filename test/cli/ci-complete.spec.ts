import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer ci', () => {
  it('should work when a test is already complete', async () => {
    const { paths, logs, cleanup, readFile, resolve, writeFile } = await createFixture('ci-complete', {
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
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    const { cliΔ } = await import('@betterer/cli');

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, ``);

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    const completeResult = await readFile(resultsPath);

    expect(completeResult).toMatchSnapshot();

    await cliΔ(fixturePath, [...ARGV, 'ci', '--workers=false']);

    expect(logs).toMatchSnapshot();

    const ciResult = await readFile(resultsPath);

    expect(ciResult).toMatchSnapshot();

    await cleanup();
  });
});
