import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should merge the results file', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { paths, cleanup, readFile } = await createFixture('merge-path', {
      '.betterer.results': `
// BETTERER RESULTS V2.
exports[\`test\`] = {
  value: \`{
|||<<<<<<< our-change
    \\"src/index.ts:315583663\\": [
      [0, 0, 11, \\"TSQuery match\\", \\"3870399096\\"],
      [1, 0, 11, \\"TSQuery match\\", \\"3870399096\\"]
    ]
|||=======
    \\"src/index.ts:913095150\\": [
      [0, 0, 11, \\"TSQuery match\\", \\"3870399096\\"]
    ]
|||>>>>>>> their-change
  }\`
};
      `.replace(/\|||/g, '')
    });

    const resultsPath = paths.results;
    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'merge']);

    const merged = await readFile(resultsPath);

    expect(merged).toMatchSnapshot();

    await cliΔ(fixturePath, [...ARGV, 'merge', '--results', resultsPath]);

    const unchanged = await readFile(resultsPath);

    expect(unchanged).toMatchSnapshot();

    await cleanup();
  });
});
