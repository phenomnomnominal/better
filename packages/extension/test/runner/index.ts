import { createFixtureDirectoryΔ } from '@betterer/fixture';
import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    const fixturesPath = path.resolve(__dirname, '../../../../../', 'fixtures');
    await createFixtureDirectoryΔ(fixturesPath);

    await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, '../../../'),
      extensionTestsPath: path.resolve(__dirname, './run.js'),
      launchArgs: [fixturesPath, '--disable-extensions']
    });
  } catch (e) {
    process.stderr.write((e as Error).name || '');
    process.stderr.write((e as Error).message || '');
    process.stderr.write((e as Error).stack || '');
    process.exitCode = 1;
  }
}

void main();

export { vscode } from './vscode';
export { createFixture } from './fixture';
