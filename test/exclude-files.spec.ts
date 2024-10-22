import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should exclude specific files from results', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('exclude-files', {
      '.betterer.ts': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
      `,
      '.betterer.exclude.ts': `
import { regexp } from '@betterer/regexp';

export default {
  test: () => regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts').exclude(/exclude.ts/).exclude('**/exclude-glob.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await writeFile(resolve('./src/index.ts'), '// Hack');
    await writeFile(resolve('./src/exclude.ts'), '// Hack');
    await writeFile(resolve('./src/exclude-glob.ts'), '// Hack');

    await betterer({ configPaths, resultsPath, workers: false });

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await betterer({
      configPaths: [resolve('./.betterer.exclude.ts')],
      resultsPath
    });

    const excludeResult = await readFile(resultsPath);

    expect(excludeResult).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
