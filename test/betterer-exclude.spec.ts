import { betterer } from '@betterer/betterer';
import { createFixtureΔ } from '@betterer/fixture';

describe('betterer', () => {
  it('should exclude specific files from results', async () => {
    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixtureΔ('test-betterer-exclude', {
      '.betterer.ts': `
import { regexp } from '@betterer/regexp';

export default {
  'regexp no hack comments': regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts')
};      
      `,
      '.betterer.exclude.ts': `
import { regexp } from '@betterer/regexp';

export default {
  'regexp no hack comments': regexp(/(\\/\\/\\s*HACK)/i).include('./src/**/*.ts').exclude(/exclude.ts/)
};      
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await writeFile(resolve('./src/index.ts'), '// Hack');
    await writeFile(resolve('./src/exclude.ts'), '// Hack');

    await betterer({ configPaths, resultsPath });

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
