import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report obsolete tests and remove them with the update flag', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile, testNames } = await createFixture('obsolete', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  'will be renamed': () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await writeFile(indexPath, `console.log('foo');`);

    const newTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['will be renamed']);

    const configFile = await readFile(paths.config);
    const updated = configFile.replace('will be renamed', 'has been renamed');
    await writeFile(paths.config, updated);

    const obsoleteTestRun = await betterer({ configPaths, resultsPath, workers: false });

    expect(testNames(obsoleteTestRun.obsolete)).toEqual(['will be renamed']);
    expect(testNames(obsoleteTestRun.new)).toEqual(['has been renamed']);
    expect(obsoleteTestRun.changed).toEqual(['will be renamed', 'has been renamed']);

    const resultObsolete = await readFile(resultsPath);

    expect(resultObsolete).toMatchSnapshot();

    const updatedTestRun = await betterer({ configPaths, resultsPath, workers: false, update: true });

    expect(testNames(updatedTestRun.removed)).toEqual(['will be renamed']);
    expect(testNames(updatedTestRun.same)).toEqual(['has been renamed']);

    const resultRemoved = await readFile(resultsPath);

    expect(resultRemoved).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
