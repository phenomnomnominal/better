import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should still reports errors if another file effects a cached TypeScript file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, readFile, cleanup, writeFile, testNames } = await createFixture('typescript-cache', {
      '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  typescript: () => typescript('./tsconfig.json', {
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
    "resolveJsonModule": true,
    "strict": false
  },
  "include": ["./src/**/*"]
}
        `,
      './src/types.ts': `
export interface MyThing {
  one: 1,
  two: 2,
}
        `,
      './src/index.ts': `
import type { MyThing } from './types.js';
        
const myThing: MyThing = {
    one: 1,
    two: 2,
    three: 3
}
        `
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const typesPath = resolve('./src/types.ts');

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false, cache: true });

    expect(testNames(newTestRun.new)).toEqual(['typescript']);

    const sameTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false, cache: true });

    expect(testNames(sameTestRun.same)).toEqual(['typescript']);

    await writeFile(typesPath, `\nexport interface MyThing {\n one: 1\n}`);

    const worseTestRun = await betterer({
      cachePath,
      configPaths,
      resultsPath,
      workers: false,
      cache: true,
      includes: [resolve('./src/index.ts')]
    });

    expect(testNames(worseTestRun.worse)).toEqual(['typescript']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
