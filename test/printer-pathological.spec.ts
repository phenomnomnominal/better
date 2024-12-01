import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should handle printing for pathological cases', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, readFile, cleanup } = await createFixture('printer-pathological', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';

const paths = [
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
  './some/long/path/to/some/file',
];

const map = {
  a: './some/long/path/to/some/file',
  b: './some/long/path/to/some/file',
  c: './some/long/path/to/some/file',
  d: './some/long/path/to/some/file',
  e: './some/long/path/to/some/file',
  f: './some/long/path/to/some/file',
  g: './some/long/path/to/some/file',
  h: './some/long/path/to/some/file',
  i: './some/long/path/to/some/file',
  j: './some/long/path/to/some/file',
  k: './some/long/path/to/some/file',
  l: './some/long/path/to/some/file',
  m: './some/long/path/to/some/file',
  n: './some/long/path/to/some/file',
  o: './some/long/path/to/some/file',
  p: './some/long/path/to/some/file',
  q: './some/long/path/to/some/file',
  r: './some/long/path/to/some/file',
  s: './some/long/path/to/some/file',
};

export default {
  'big array': () => new BettererTest({
    test: () => paths,
    constraint: () => 'same',
    goal: 0
  }),
  'big object': () => new BettererTest({
    test: () => map,
    constraint: () => 'same',
    goal: 0
  })
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
