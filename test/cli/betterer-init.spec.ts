import { BettererPackageJSON, initΔ } from '@betterer/cli';

import { createFixture } from '../fixture';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should initialise betterer in a repo', async () => {
    const { logs, paths, readFile, cleanup, resolve } = await createFixture(
      'test-betterer-init',
      {
        'package.json': `
      {
        "name": "betterer-test-betterer-init",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const configPath = `${paths.config}.ts`;
    const fixturePath = paths.cwd;
    const packageJSONPath = resolve('./package.json');

    await initΔ(fixturePath, ARGV);

    const packageJSON = JSON.parse(await readFile(packageJSONPath)) as BettererPackageJSON;

    expect(packageJSON.scripts.betterer).toEqual('betterer');
    expect(packageJSON.devDependencies['@betterer/cli']).toBeDefined();

    const config = await readFile(configPath);

    expect(config).toEqual('export default {\n  // Add tests here ☀️\n};');

    expect(logs).toMatchSnapshot();

    await cleanup();
  });

  it('should work multiple times', async () => {
    const { logs, paths, cleanup } = await createFixture(
      'test-betterer-init-multiple',
      {
        'package.json': `
      {
        "name": "betterer-test-betterer-init-multiple",
        "version": "0.0.1"
      }
      `
      },
      {
        logFilters: [/🌟 Initialising Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    let throws = false;
    try {
      await initΔ(fixturePath, ARGV);
      await initΔ(fixturePath, ARGV);
      await cleanup();
    } catch {
      throws = true;
    }

    expect(throws).toBe(false);

    expect(logs).toMatchSnapshot();
  });
});
