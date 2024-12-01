import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

describe('betterer.watch', () => {
  it.each([{ ignores: 1234 }, { ignores: true }, { ignores: {} }, { ignores: [1234] }])(
    `should throw when there is invalid config: %s`,
    async (config) => {
      const { betterer } = await import('@betterer/betterer');

      const { cleanup, logs, paths } = await createFixture('watch-config-validation', {
        '.betterer.js': ''
      });

      const configPaths = [paths.config];
      const resultsPath = paths.results;

      // @ts-expect-error testing invalid config
      await expect(async () => await betterer.watch({ configPaths, resultsPath, ...config })).rejects.toThrow();

      expect(logs).toMatchSnapshot();

      await cleanup();
    }
  );
});
