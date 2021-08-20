import { betterer } from '@betterer/betterer';

import { createFixture } from './fixture';

describe('betterer --reporter', () => {
  it('should throw when there is an invalid hook name', async () => {
    const { logs, paths, cleanup, resolve } = await createFixture('reporter-invalid-hook-name', {
      'reporter.js': `
module.exports.reporter = {
    notAHook: ''
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = [resolve('reporter.js')];

    await expect(async () => await betterer({ configPaths, resultsPath, reporters })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
