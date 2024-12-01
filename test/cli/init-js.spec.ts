import { describe, it, expect } from 'vitest';

import type { BettererPackageJSON } from '@betterer/cli';

import path from 'node:path';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

import { version } from '../../packages/cli/package.json';

describe('betterer cli', () => {
  it('should initialise betterer in a repo with JS', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths, readFile, resolve } = await createFixture(
      'init-js',
      {
        'package.json': `
      {
        "name": "init-js",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const { dir, name } = path.parse(paths.config);
    const configPath = `${path.join(dir, name)}.js`;
    const fixturePath = paths.cwd;
    const packageJSONPath = resolve('./package.json');

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'init', '--config', configPath]);

    const packageJSON = JSON.parse(await readFile(packageJSONPath)) as BettererPackageJSON;

    /* eslint-disable @typescript-eslint/dot-notation -- prefer computed key */
    expect(packageJSON.scripts?.['betterer']).toEqual('betterer');
    expect(packageJSON.devDependencies?.['@betterer/cli']).toEqual(`^${version}`);
    expect(packageJSON.devDependencies?.['typescript']).not.toBeDefined();
    /* eslint-enable @typescript-eslint/dot-notation */

    const config = await readFile(configPath);

    expect(config).toEqual('export default {\n  // Add tests here ☀️\n};\n');

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
