import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work when there are no relevant files for a StyleLint test', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, cleanup } = await createFixture('stylelint-no-files', {
      '.betterer.ts': `
import { stylelint } from '@betterer/stylelint';

export default {
  'stylelint': () => stylelint({
    rules: {
      'order/order': [
        { type: 'rule' },
        { type: 'rule', selector: /^&:\\w/ },
        { type: 'rule', selector: /^&/ },
      ]
    }
  }).include('./src/**/*.css')
};
    `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await betterer({ configPaths, resultsPath, workers: false });

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
