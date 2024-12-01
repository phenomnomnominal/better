import { describe, it, expect } from 'vitest';
import path from 'node:path';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should enable automerge configuration without git', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'init-automerge-no-git',
      {
        './package.json': `
      {
        "name": "init-automerge",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/, /: running /, /running.../]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'init', '--automerge', `--repoPath=${path.sep}`]);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
