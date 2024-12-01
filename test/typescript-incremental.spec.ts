import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work with an incremental build', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, cleanup, readFile, writeFile, testNames } = await createFixture(
      'typescript-incremental',
      {
        '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  typescript: () => typescript('./tsconfig.json', {
    incremental: true,
    tsBuildInfoFile: './.betterer.tsbuildinfo'
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
    "resolveJsonModule": true,
    "strict": false
  },
  "include": ["./src/**/*.ts"]
}
        `,
        './src/foo.ts': `
import { bar } from './bar'; 

export function foo (a: number, b: number, c:number) {
  return bar(a * 2, b * 2, c * 2);
}
        `,
        './src/bar.ts': `
export function bar (a: number, b: number, c:number) {
  return (a * b) ** c;
}
        `
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const buildInfoPath = resolve('./.betterer.tsbuildinfo');

    await writeFile(indexPath, `import { foo } from './foo';\n\nfoo('a', 'b', 'c');`);

    const newStart = new Date().getTime();
    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });
    const newTime = new Date().getTime() - newStart;

    expect(testNames(newTestRun.new)).toEqual(['typescript']);

    const buildInfo = await readFile(buildInfoPath);

    expect(buildInfo).not.toBeNull();

    const sameStart = new Date().getTime();
    const sameTestRun = await betterer({ configPaths, resultsPath, workers: false });
    const sameTime = new Date().getTime() - sameStart;

    expect(sameTime).toBeLessThan(newTime);

    expect(testNames(sameTestRun.same)).toEqual(['typescript']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
