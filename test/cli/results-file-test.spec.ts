import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should report the current results for a file test', async () => {
    const { logs, paths, cleanup } = await createFixture('results-file-test', {
      '.betterer.js': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
    `,
      'src/file-with-issue.ts': `
// HACK:
    `,
      'src/file-with-issues.ts': `
// HACK:
// HACK:
    `,
      'src/file-with-no-issues.ts': ``
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const fixturePath = paths.cwd;

    const { betterer } = await import('@betterer/betterer');

    await betterer({ configPaths, resultsPath, workers: false, silent: true });

    const { cliΔ } = await import('@betterer/cli');

    await cliΔ(fixturePath, [...ARGV, 'results']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
