import { createFixtureDirectoryΔ } from '@betterer/fixture';
import path from 'node:path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    const fixturesPath = path.resolve(__dirname, '../../../../../', 'fixtures');
    await createFixtureDirectoryΔ(fixturesPath);

    await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, '../../../'),
      extensionTestsPath: path.resolve(__dirname, './run.js'),
      launchArgs: [fixturesPath, '--disable-extensions', '--disable-workspace-trust']
    });
  } catch (e) {
    process.stderr.write((e as Error).name || '');
    process.stderr.write((e as Error).message || '');
    process.stderr.write((e as Error).stack ?? '');
    process.exitCode = 1;
  }

  // This file runs once outside the extension and once inside the extension.
  // When the outside instance finishes, it should exit.
  if (!process.env.VSCODE_PID) {
    process.exit();
  }
}

void main();

export { vscode } from './vscode.js';
export { createFixture } from './fixture.js';
