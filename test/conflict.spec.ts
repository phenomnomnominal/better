import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when there is a merge conflict in the results file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup } = await createFixture('conflict', {
      '.betterer.ts': `
import { tsquery } from '@betterer/tsquery';

export default {
  test: () => tsquery(
    'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
  ).include('./src/**/*.ts')
};
              `,
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
      `.replace(/\|||/g, ''), // Mess with it a bit so that tooling doesn't think this is a real conflict:
      'src/index.ts': `
console.log('foo');
console.info('foo');
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false });

    expect(logs).toMatchSnapshot();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await cleanup();
  });
});
