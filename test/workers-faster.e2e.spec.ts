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
  it('actually goes faster in workers', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup, resolve, writeFile, testNames } = await createFixture('workers-faster', {
      '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  'test 1': () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts'),
  'test 2': () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts'),
  'test 3': () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts'),
  'test 4': () => typescript('./tsconfig.json', {
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

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, INDEX_SOURCE);

    const noWorkersStart = new Date().getTime();
    const noWorkersTestRun = await betterer({ configPaths, resultsPath, workers: false });
    const noWorkersTime = new Date().getTime() - noWorkersStart;

    expect(testNames(noWorkersTestRun.ran)).toEqual(['test 1', 'test 2', 'test 3', 'test 4']);

    const workersStart = new Date().getTime();
    const workersTestRun = await betterer({ configPaths, resultsPath, workers: true });
    const workersTime = new Date().getTime() - workersStart;

    expect(testNames(workersTestRun.same)).toEqual(['test 1', 'test 2', 'test 3', 'test 4']);

    expect(workersTime).toBeLessThan(noWorkersTime);

    await cleanup();
  });
});
