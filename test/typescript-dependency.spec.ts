import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the status of the TypeScript compiler when there is a npm dependency', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, cleanup, writeFile, testNames } = await createFixture('typescript-dependency', {
      '.betterer.ts': `
import { typescript } from '@betterer/typescript';

export default {
  typescript: () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts')
};
        `,
      'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext", "dom"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": [],
    "resolveJsonModule": true,
    "strict": false
  },
  "include": ["./src/**/*"]
}
        `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `import { ESLint } from 'eslint';\nconsole.log(ESLINT);`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['typescript']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
