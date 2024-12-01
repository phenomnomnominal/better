import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

const INDEX_SOURCE = `
type A = {
    a1: string;
}
type B = {
    b1: string;
    b2: string;
}
type C = {
    c1: string;
    c2: string;
    c3: string;
}
type D = {
    d1: string;
    d2: string;
    d3: string;
    d4: string;
}
type E = {
    e1: string;
    e2: string;
    e3: string;
    e4: string;
    e5: string;
}
type F = {
    f1: string;
    f2: string;
    f3: string;
    f4: string;
    f5: string;
    f6: string;
}

const a: A = { };
const b: B = { };
const c: C = { };
const d: D = { };
const e: E = { };
const f: F = { };
`;

describe('betterer', () => {
  it('should stabilise the number of missing properties in issue messages', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, resolve, cleanup, writeFile, testNames } = await createFixture(
      'typescript-fix-missing-properties',
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
