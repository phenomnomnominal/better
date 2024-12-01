import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it.skip('should report the status of a new knip config', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, resolve, readFile, cleanup, writeFile, testNames } = await createFixture('knip', {
      '.betterer.ts': `
import { knip } from '@betterer/knip';

export default {
  knip: () => knip('./knip.json').include(['./src/**/*.ts'])
};
      `,
      'knip.json': `
{
  "entry": [".betterer.ts", "src/index.ts"],
  "project": ["**/*.ts"]
}
      `,
      'package.json': `
{
  "name": "knip-test",
  "version": "0.0.1",
  "dependencies": {
    "fuck-shit-up": "^2.0.0"
  }
}
      `,
      'src/index.ts': `
import 'thanos-glove';
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['knip']);

    const sameTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(sameTestRun.same)).toEqual(['knip']);

    await writeFile(indexPath, `import 'thanos-glove'; import 'console.fuck';`);

    const worseTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(worseTestRun.worse)).toEqual(['knip']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, `import 'fuck-shit-up';`);

    const betterTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(betterTestRun.better)).toEqual(['knip']);

    const completedTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(completedTestRun.completed)).toEqual(['knip']);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
