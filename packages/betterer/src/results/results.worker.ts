import type { BettererConfig } from '../config/types.js';
import type { BettererTestNames } from '../test/index.js';
import type { BettererResultsSerialised } from './types.js';

import { invariantΔ } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';

import { BettererResultsΩ } from './results.js';

let results: BettererResultsΩ | null = null;

/** @knipignore part of worker API */
export async function init(config: BettererConfig): Promise<void> {
  results = await BettererResultsΩ.create(config.resultsPath);
}

/** @knipignore part of worker API */
export function getBaseline(testName: string): string {
  checkInitialised(results);
  return results.getBaseline(testName);
}

/** @knipignore part of worker API */
export function getExpected(testName: string): string {
  checkInitialised(results);
  return results.getExpected(testName);
}

/** @knipignore part of worker API */
export function getExpectedTestNames(): BettererTestNames {
  checkInitialised(results);
  return results.getExpectedTestNames();
}

/** @knipignore part of worker API */
export function hasBaseline(testName: string): boolean {
  checkInitialised(results);
  return results.hasBaseline(testName);
}

/** @knipignore part of worker API */
export async function write(result: BettererResultsSerialised): Promise<string | null> {
  checkInitialised(results);
  return await results.write(result);
}

function checkInitialised(results: BettererResultsΩ | null): asserts results is BettererResultsΩ {
  invariantΔ(results, '`results` should be set when `init` is called!');
}

exposeToMainΔ({
  init,
  getBaseline,
  getExpected,
  getExpectedTestNames,
  hasBaseline,
  write
});
