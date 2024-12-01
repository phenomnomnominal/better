import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer.watch', () => {
  it('should work when run from the cli', async () => {
    const { logs, paths, cleanup, sendKeys } = await createFixture('watch-cli', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `
    });

    const fixturePath = paths.cwd;

    const { cliΔ } = await import('@betterer/cli');

    const done = cliΔ(fixturePath, [...ARGV, 'watch', '--workers=false'], false);

    // Press "q" to quit watch mode:
    await sendKeys('q');

    await done;

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
