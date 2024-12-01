import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should work with an inline reporter', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup } = await createFixture('reporter-inline', {
      '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { bigger } from '@betterer/constraints';
import { persist } from '@betterer/fixture';

const grows = persist(import.meta.url, 'grows', 0);

export const test = () => new BettererTest({
  test: () => grows.increment(),
  constraint: bigger
});
      `
    });

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const reporters = [
      {
        configError() {
          return;
        },
        contextStart() {
          return;
        },
        contextEnd() {
          return;
        },
        contextError() {
          return;
        },
        suiteStart() {
          return;
        },
        suiteEnd() {
          return;
        },
        suiteError() {
          return;
        },
        runStart() {
          return;
        },
        runEnd() {
          return;
        },
        runError() {
          return;
        }
      }
    ];

    let throws = false;
    try {
      await betterer({ configPaths, resultsPath, reporters, workers: false });
    } catch {
      throws = true;
    }

    expect(throws).toBe(false);

    await cleanup();
  });
});
