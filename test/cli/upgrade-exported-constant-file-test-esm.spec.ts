import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer', 'upgrade'];

describe('betterer upgrade', () => {
  it('should upgrade exported constant file tests in an ES module', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'upgrade-exported-constant-file-test-esm',
      {
        './.betterer.ts': `
import { BettererFileTest } from '@betterer/betterer';

export const countFiles = new BettererFileTest(async (files, fileTestResult) => {        
  const [filePath] = files;
  const file = fileTestResult.addFile(filePath, '');
  file.addIssue(0, 0, '\`$' + '{key}\`');
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
