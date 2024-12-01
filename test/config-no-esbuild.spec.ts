import { describe, expect, it, vitest } from 'vitest';

import { createFixture } from './fixture.js';

vitest.mock('esbuild', (): null => {
  return null;
});

const isNode16 = process.version.startsWith('v16');

describe('betterer', () => {
  it.skipIf(isNode16)('should throw with a .betterer.ts file when esbuild is not available', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup, resolve } = await createFixture('config-no-esbuild', {
      '.betterer.tsx': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';

<{ FANCY NEW SYNTAX }>

export default {
  test: () => new BettererTest({
    test: () => <ShouldThrow/>,
    constraint: bigger
  })
};
      `
    });

    const configPaths = [resolve('.betterer.tsx')];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
