import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should handle a global include', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('include-global', {
      '.betterer.ts': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('src/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');
    const globalValidPath = resolve('./src/global.ts');
    const globalInvalidPath = resolve('./global.ts');

    await writeFile(indexPath, '// Hack');

    const localIncludeSummary = await betterer({ configPaths, cwd: paths.cwd, resultsPath, workers: false });

    const [localIncludeRun] = localIncludeSummary.runs;

    expect(localIncludeRun.filePaths).toEqual([indexPath]);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(globalValidPath, '// Hack');
    await writeFile(globalInvalidPath, '// Hack');

    const globalIncludeSummary = await betterer({
      configPaths,
      cwd: paths.cwd,
      includes: [globalValidPath, globalInvalidPath],
      resultsPath,
      workers: false,
      update: true
    });

    expect(globalIncludeSummary.filePaths).toContain(globalInvalidPath);
    expect(globalIncludeSummary.filePaths).toContain(globalValidPath);

    const [globalIncludeRun] = globalIncludeSummary.runs;

    expect(globalIncludeRun.filePaths).toEqual([globalValidPath]);

    const globalIncludeResult = await readFile(resultsPath);

    expect(globalIncludeResult).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
