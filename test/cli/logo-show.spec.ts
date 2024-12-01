import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should show the logo', async () => {
    const { logs, paths, cleanup } = await createFixture('logo-show', {
      '.betterer.js': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';

export default {
  'test 1': () => new BettererTest({
    test: () => 0,
    constraint: bigger
  }),
};
      `
    });

    const fixturePath = paths.cwd;

    const { cliΔ } = await import('@betterer/cli');

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false'], false);

    await cliΔ(fixturePath, [...ARGV, 'start', '--workers=false', '--logo'], false);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
