import type {
  BettererContext,
  BettererContextSummary,
  BettererRun,
  BettererRunSummary,
  BettererSuite,
  BettererSuiteSummary
} from '@betterer/betterer';

import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer --reporter', () => {
  it('should work with a lifecycle based reporter', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, cleanup } = await createFixture('reporter-lifecycle', {
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
        async contextStart(_: BettererContext, lifecycle: Promise<BettererContextSummary>) {
          try {
            await lifecycle;
          } catch {
            return;
          }
        },
        async suiteStart(_: BettererSuite, lifecycle: Promise<BettererSuiteSummary>) {
          try {
            await lifecycle;
          } catch {
            return;
          }
        },
        async runStart(_: BettererRun, lifecycle: Promise<BettererRunSummary>) {
          try {
            await lifecycle;
          } catch {
            return;
          }
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
