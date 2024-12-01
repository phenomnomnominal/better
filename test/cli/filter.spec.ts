import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should filter tests by name', async () => {
    const { logs, paths, cleanup } = await createFixture(
      'filter',
      {
        '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger, smaller } from '@betterer/constraints';

export default {
  'test 1': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
  'test 2': () => new BettererTest({
    test: () => 0,
    constraint: smaller
  }),
  'test 3': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  })
};
      `
      },
      {
        logFilters: [/: running /, /running.../]
      }
    );

    const fixturePath = paths.cwd;

    const { cliΔ } = await import('@betterer/cli');

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false', '--filter', '1'], false);

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false', '--filter', '1', '--filter', '3'], false);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
