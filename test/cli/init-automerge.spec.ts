import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should enable automerge configuration', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths, resolve, readFile } = await createFixture(
      'init-automerge',
      {
        './package.json': `
      {
        "name": "init-automerge",
        "version": "0.0.1"
      }
      `,
        './.git/file.txt': 'HOLD'
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'init', '--automerge']);

    const attributesFile = await readFile(resolve('.gitattributes'));

    expect(attributesFile).toMatchSnapshot();

    const gitconfigFile = await readFile(resolve('./.git/config'));

    expect(gitconfigFile).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
