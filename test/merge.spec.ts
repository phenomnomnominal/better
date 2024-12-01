import { describe, it, expect } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should merge the results file', async () => {
    const { merge } = await import('@betterer/betterer');

    const { paths, cleanup, readFile } = await createFixture('merge', {
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

    process.env.BETTERER_WORKER = 'false';

    await merge({ resultsPath });

    const merged = await readFile(resultsPath);

    expect(merged).toMatchSnapshot();

    await merge({ resultsPath });

    const unchanged = await readFile(resultsPath);

    expect(unchanged).toMatchSnapshot();

    await cleanup();
  });
});
