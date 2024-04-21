import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer', 'upgrade'];

describe('betterer upgrade', () => {
  it('should upgrade exported constant built-in tests in an ES module', async () => {
    const { cli__ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'upgrade-exported-constant-built-in-esm',
      {
        './.betterer.ts': `
import { regexp } from '@betterer/regexp';

export const noHack = regexp(/HACK/i).include('**/*.ts');
        `
      },
      {
        logFilters: [/🌟 Upgrading Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cli__(fixturePath, ARGV);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
