import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer ci', () => {
  it('should throw an error when a test fails', async () => {
    const { paths, logs, cleanup } = await createFixture('ci-failure', {
      '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';

export default {
  throws: () => {
    return new BettererTest({
      test: () => { throw new Error(); },
      constraint: smaller
    });
  }
};
      `
    });

    const fixturePath = paths.cwd;

    const { cliΔ } = await import('@betterer/cli');

    await expect(async () => {
      await cliΔ(fixturePath, [...ARGV, 'ci', '--workers=false']);
    }).rejects.toThrow('Tests failed while running in CI mode. ❌');

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
