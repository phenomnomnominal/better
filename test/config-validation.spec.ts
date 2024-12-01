import { describe, expect, it, vitest } from 'vitest';

import { invariantΔ } from '@betterer/errors';

import { createFixture } from './fixture.js';

vitest.mock('node:os', async (importOriginal): Promise<typeof import('node:os')> => {
  const os: typeof import('node:os') = await importOriginal();
  const [cpu] = os.cpus();
  invariantΔ(cpu, 'There will always be at least one CPU or something is very wrong!');
  return {
    ...os,
    cpus: () => [cpu]
  };
});

describe('betterer', () => {
  it.each([
    { cache: 1234 },
    { cache: 'betterer' },
    { cache: {} },
    { cachePath: 1234 },
    { cachePath: {} },
    { cachePath: true },
    { ci: 1234 },
    { ci: 'betterer' },
    { ci: {} },
    { configPaths: 1234 },
    { configPaths: true },
    { configPaths: {} },
    { configPaths: [1234] },
    { cwd: 1234 },
    { cwd: {} },
    { filters: 1234 },
    { filters: true },
    { filters: {} },
    { filters: [1234] },
    { logo: 1234 },
    { logo: {} },
    { logo: [1234] },
    { precommit: 1234 },
    { precommit: 'betterer' },
    { precommit: {} },
    { resultsPath: 1234 },
    { resultsPath: true },
    { resultsPath: {} },
    { silent: 1234 },
    { silent: 'betterer' },
    { silent: {} },
    { strict: 1234 },
    { strict: 'betterer' },
    { strict: {} },
    { update: 1234 },
    { update: 'betterer' },
    { update: {} },
    { workers: 'betterer' },
    { workers: NaN },
    { workers: {} },
    { workers: -1 },
    { workers: 1000 }
  ])(`should throw when there is invalid config: %s`, async (config) => {
    const { betterer } = await import('@betterer/betterer');

    const { cleanup, logs, paths } = await createFixture('config-validation', {
      '.betterer.js': ''
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    // @ts-expect-error testing invalid config
    await expect(async () => await betterer({ configPaths, resultsPath, ...config })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
