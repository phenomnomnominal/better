import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should work multiple times', async () => {
    const { cli__ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'init-multiple',
      {
        'package.json': `
      {
        "name": "init-multiple",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    let throws = false;
    try {
      await cli__(fixturePath, [...ARGV, 'init']);
      await cli__(fixturePath, [...ARGV, 'init']);
      await cleanup();
    } catch {
      throws = true;
    }

    expect(throws).toBe(false);

    expect(logs).toMatchSnapshot();
  });
});
