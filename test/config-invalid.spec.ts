import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it('should throw when there is an invalid config file', async () => {
    const { logs, paths, cleanup } = await createFixture('config-invalid', {
      '.betterer.ts': `
export const test = // Syntax Error
`
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
