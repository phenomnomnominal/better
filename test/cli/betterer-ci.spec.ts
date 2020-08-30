import { ciΔ } from '@betterer/cli';
import { createFixtureΔ } from '@betterer/fixture';

const ARGV = ['node', './bin/betterer'];

describe('betterer ci', () => {
  it('should add a diff to the summary if there is any change to the results file', async () => {
    const { paths, logs, cleanup, resolve, writeFile } = await createFixtureΔ('test-betterer-ci-diff', {
      'src/index.ts': `
const a = 'a';
const one = 1;
console.log(a * one);
      `,
      '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  'typescript use strict mode': typescript('./tsconfig.json', {
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

    const fixturePath = paths.cwd;
    const indexPath = resolve('./src/index.ts');

    await ciΔ(fixturePath, ARGV);

    await writeFile(indexPath, `const a = 'a';\nconst one = 1;\nconsole.log(one + one);\nconsole.log(a * one);`);

    const diffSummary = await ciΔ(fixturePath, ARGV);

    expect(diffSummary.expected).not.toBeNull();
    expect(diffSummary.hasDiff).toEqual(true);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
