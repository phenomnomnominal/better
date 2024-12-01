import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer', 'upgrade'];

describe('betterer upgrade', () => {
  it('should upgrade exported constant tests in an ES module', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'upgrade-exported-constant-test-esm',
      {
        './.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';

let start = 0;

export const getsBetter = new BettererTest({
  test: () => start++,
  constraint: bigger
});
        `
      },
      {
        logFilters: [/🌟 Upgrading Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, ARGV);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
