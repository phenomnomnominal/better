import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

const INDEX_SOURCE = `export function extractIds(list) {
  return list.map(member => member.id);
}

function bar() {
  return this.baz.toUpperCase();
}

const foo = {
  baz: 'baz',
  bar
};

foo.bar();

export function findNumberFixed(numbers: Array<number>, search: number) {
  const number = numbers.find(n => n === search);
  return number.toFixed(2);
}

export class Foo {
  private bar: number;
  constructor() {}
}

export function sum(num1: number, num2: number) {
  return num1 + num2;
}

sum.apply(null, [1, 2, 3]);
`;

describe('betterer', () => {
  it('should report the status of the TypeScript compiler in strict mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, readFile, cleanup, writeFile, testNames } = await createFixture('typescript-strict', {
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
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, INDEX_SOURCE);

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['typescript']);

    const sameTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['typescript']);

    await writeFile(indexPath, `${INDEX_SOURCE}\nconst a = 'a';\nconst one = 1;\nconsole.log(a * one);`);

    const worseTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['typescript']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, INDEX_SOURCE.replace('sum.apply(null, [1, 2, 3]);', 'sum.apply(null, [1, 2]);'));

    const betterTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['typescript']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
