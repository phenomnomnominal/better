import { createFixture } from './fixture';

describe('betterer', () => {
  it(`should throw if it doesn't return a BettererTest`, async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, cleanup } = await createFixture('test-not-a-betterertest', {
      '.betterer.js': `

module.exports = {
  test: () => {}
};
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await expect(async () => await betterer({ configPaths, resultsPath, workers: false })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
