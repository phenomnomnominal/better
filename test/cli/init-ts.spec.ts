import type { BettererPackageJSON } from '@betterer/cli';

import { describe, expect, it } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

import { version } from '@betterer/cli/package.json';

describe('betterer cli', () => {
  it('should initialise betterer in a repo with TS', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths, readFile, resolve } = await createFixture(
      'init-ts',
      {
        'package.json': `
      {
        "name": "init-ts",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const fixturePath = paths.cwd;
    const packageJSONPath = resolve('./package.json');

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'init', '--config', paths.config]);

    const packageJSON = JSON.parse(await readFile(packageJSONPath)) as BettererPackageJSON;

    /* eslint-disable @typescript-eslint/dot-notation -- prefer computed key */
    expect(packageJSON.scripts?.['betterer']).toEqual('betterer');
    expect(packageJSON.devDependencies?.['@betterer/cli']).toEqual(`^${version}`);
    expect(packageJSON.devDependencies?.['typescript']).toBeDefined();
    /* eslint-enable @typescript-eslint/dot-notation */

    const config = await readFile(paths.config);

    expect(config).toEqual('export default {\n  // Add tests here ☀️\n};\n');

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
