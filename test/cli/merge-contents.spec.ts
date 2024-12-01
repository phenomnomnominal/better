import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should merge the given contents', async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { paths, cleanup, readFile } = await createFixture('merge-contents', {
      '.betterer.results': ''
    });

    const ours = `// BETTERER RESULTS V2.
exports[\`test\`] = {
  value: \`{
    \\"src/index.ts:315583663\\": [
      [0, 0, 11, \\"TSQuery match\\", \\"3870399096\\"],
      [1, 0, 11, \\"TSQuery match\\", \\"3870399096\\"]
    ]
  }\`
};
    `;
    const theirs = `// BETTERER RESULTS V2.
exports[\`test\`] = {
  value: \`{
    \\"src/index.ts:913095150\\": [
      [0, 0, 11, \\"TSQuery match\\", \\"3870399096\\"]
    ]
  }\`
};
        `;

    const resultsPath = paths.results;
    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, [...ARGV, 'merge', ours, theirs]);

    const merged = await readFile(resultsPath);

    expect(merged).toMatchSnapshot();

    await cleanup();
  });
});
