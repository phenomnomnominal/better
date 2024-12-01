import type { BettererLogger } from '@betterer/logger';

import type { BettererConfig } from '../config/types.js';
import type { BettererFilePaths, BettererFileResolverΩ, BettererFSWorker } from '../fs/index.js';
import type { BettererResultsWorker } from '../results/index.js';
import type { BettererTest, BettererTestMeta } from '../test/index.js';
import type { BettererRunMeta } from './meta/index.js';
import type { BettererRunSummary } from './types.js';

import { invariantΔ } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';

import { isBettererResolverTest, isBettererTest } from '../test/index.js';
import { loadTest, BettererWorkerRunΩ } from './worker-run.js';
import { setGlobals } from '../globals.js';

const TEST_META_MAP: Record<string, [BettererTest, BettererTestMeta, BettererRunMeta]> = {};

/** @knipignore part of worker API */
export async function init(
  testMeta: BettererTestMeta,
  config: BettererConfig,
  fs: BettererFSWorker,
  results: BettererResultsWorker
): Promise<BettererRunMeta> {
  // If we're in a worker, we need to populate the globals:
  if (process.env.BETTERER_WORKER !== 'false') {
    setGlobals(config, fs, null, results, null, null);
  }

  const { name } = testMeta;

  const test = await loadTest(testMeta);
  const isTest = isBettererTest(test);

  invariantΔ(isTest, `"${name}" must return a \`BettererTest\`!`);

  const isNew = !(await results.api.hasBaseline(name));
  const { isOnly, isSkipped } = test;
  const hasFilePaths = isBettererResolverTest(test);
  let isCacheable = false;
  if (hasFilePaths) {
    const { resolver } = test;
    const resolverΩ = resolver as BettererFileResolverΩ;
    isCacheable = resolverΩ.isCacheable;
  }

  const runMeta = { hasFilePaths, isCacheable, isNew, isOnly, isSkipped };

  TEST_META_MAP[testMeta.name] = [test, testMeta, runMeta];
  return runMeta;
}

/** @knipignore part of worker API */
export function run(
  logger: BettererLogger,
  testName: string,
  filePaths: BettererFilePaths | null,
  isFiltered: boolean,
  timestamp: number
): Promise<BettererRunSummary> {
  const meta = TEST_META_MAP[testName];
  invariantΔ(meta, `Worker has not been initialised for "${testName}"!`);
  const [test, testMeta, runMeta] = meta;

  const run = new BettererWorkerRunΩ(test.config, logger, testMeta, runMeta);
  return run.run(filePaths, isFiltered, timestamp);
}

exposeToMainΔ({
  init,
  run
});
