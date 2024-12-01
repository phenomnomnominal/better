import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should handle a global exclude', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('exclude-global', {
      '.betterer.ts': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const globalPath = resolve('./src/global.ts');

    await writeFile(indexPath, '// Hack');
    await writeFile(globalPath, '// Hack');

    await betterer({ configPaths, cwd: paths.cwd, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    const globalExcludeSummary = await betterer({
      configPaths,
      cwd: paths.cwd,
      excludes: [/global.ts/],
      resultsPath,
      workers: false
    });

    expect(globalExcludeSummary.filePaths).toEqual([indexPath]);

    const globalExcludeResult = await readFile(resultsPath);

    expect(globalExcludeResult).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
