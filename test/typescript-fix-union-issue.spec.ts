import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

const INDEX_SOURCE = `
let a: 9 | 5 | 3 | 1 | 4 | 8 | 6 | 2 | 7 | null;
const b: 'A' | 'U' | 'Q' | 'H' | 'Z' | 'L' | 'W' | 'B' | 'J' | 'M' | 'T' | 'E' | 'N' | 'K' | 'W' | 'I' | 'P' | 'S' | 'Y' | 'G' | 'R' | 'X' | 'O' | 'C' | 'F' | 'D' | 'V' = a;
`;

describe('betterer', () => {
  it('should stabilise the order of union types in issue messages', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, resolve, cleanup, writeFile, testNames } = await createFixture(
      'typescript-fix-union-issue',
      {
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
        `
      }
    );

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, INDEX_SOURCE);

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['typescript']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
