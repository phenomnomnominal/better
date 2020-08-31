import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer', () => {
  it('should report the status of the TypeScript compiler', async () => {
    const { paths, logs, resolve, readFile, cleanup, writeFile, runNames } = await createFixture(
      'test-betterer-typescript',
      {
        '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  'typescript use strict mode': typescript('./tsconfig.json', {
    strict: true
  })
};
      `,
        'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": ["../../node_modules/@types/"],
    "resolveJsonModule": true
  },
  "include": ["./src/**/*", ".betterer.ts"]
}
      `
      }
    );

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `const a = 'a';\nconst one = 1;\nconsole.log(a * one);`);

    const newTestRun = await betterer({ configPaths, resultsPath });

    expect(runNames(newTestRun.new)).toEqual(['typescript use strict mode']);

    const sameTestRun = await betterer({ configPaths, resultsPath });

    expect(runNames(sameTestRun.same)).toEqual(['typescript use strict mode']);

    await writeFile(indexPath, `const a = 'a';\nconst one = 1;\nconsole.log(a * one, one * a);`);

    const worseTestRun = await betterer({ configPaths, resultsPath });

    expect(runNames(worseTestRun.worse)).toEqual(['typescript use strict mode']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, ``);

    const betterTestRun = await betterer({ configPaths, resultsPath });

    expect(runNames(betterTestRun.better)).toEqual(['typescript use strict mode']);

    const completedTestRun = await betterer({ configPaths, resultsPath });

    expect(runNames(completedTestRun.completed)).toEqual(['typescript use strict mode']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });

  it('should throw if there is no configFilePath', async () => {
    const { paths, logs, cleanup } = await createFixture('test-betterer-typescript-no-config-file-path', {
      '.betterer.js': `
const { typescript } = require('@betterer/typescript');

module.exports = {
  'typescript use strict mode': typescript()
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });

  it('should throw if there is no extraCompilerOptions', async () => {
    const { paths, logs, cleanup } = await createFixture('test-betterer-typescript-no-compiler-options', {
      '.betterer.js': `
const { typescript } = require('@betterer/typescript');

module.exports = {
  'typescript use strict mode': typescript('./tsconfig.json')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
