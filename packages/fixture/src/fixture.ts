import type { BettererRunSummaries, BettererTestNames } from '@betterer/betterer';

import type { Fixture, FixtureFactory, FixtureFileSystemFiles, FixtureOptions } from './types.js';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { createFixtureFS } from './fs.js';
import { createFixtureLogs } from './logging.js';
import { createFixtureStdout } from './stdout.js';

/** @internal Definitely not stable! Please don't use! */
export async function createFixtureDirectoryΔ(fixturesPath: string): Promise<FixtureFactory> {
  try {
    await fs.mkdir(fixturesPath);
  } catch {
    // Move on...
  }

  return async function createFixtureΔ(
    fixtureName: string,
    files?: FixtureFileSystemFiles,
    options?: FixtureOptions
  ): Promise<Fixture> {
    const fixturePath = path.resolve(fixturesPath, fixtureName);
    const fixtureFS = await createFixtureFS(fixturePath, files);

    const fixtureLogs = createFixtureLogs(fixtureName, options);
    const fixtureStdout = createFixtureStdout();

    // Wait long enough that the watch mode debounce doesn't get in the way:
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      ...fixtureFS,
      ...fixtureStdout,
      ...fixtureLogs,
      testNames
    };
  };
}

function testNames(runs: BettererRunSummaries): BettererTestNames {
  return runs.map((run) => run.name);
}
