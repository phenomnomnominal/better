import { invariantΔ } from '@betterer/errors';
import type { BettererConfig } from '../config/index.js';
import type { BettererFileCache, BettererFilePaths, BettererVersionControl } from './types.js';

import { exposeToMainΔ } from '@betterer/worker';

import { BettererGitΩ } from './git.js';
import { BettererFileCacheΩ } from './file-cache.js';

let versionControl: BettererVersionControl | null = null;
let cache: BettererFileCache | null = null;

/** @knipignore part of worker API */
export async function init(config: BettererConfig): Promise<void> {
  if (config.cache) {
    cache = await BettererFileCacheΩ.create(config.cachePath, config.configPaths);
  }
  versionControl = await BettererGitΩ.create(cache, config.versionControlPath);
}

/** @knipignore part of worker API */
export function add(resultsPath: string): Promise<void> {
  checkInitialisedVersionControl(versionControl);
  return versionControl.add(resultsPath);
}

/** @knipignore part of worker API */
export function getFilePaths(): BettererFilePaths {
  checkInitialisedVersionControl(versionControl);
  return versionControl.getFilePaths();
}

/** @knipignore part of worker API */
export function sync(): Promise<void> {
  checkInitialisedVersionControl(versionControl);
  return versionControl.sync(cache);
}

/** @knipignore part of worker API */
export function clearCache(testName: string): void {
  checkInitialisedCache(cache);
  cache.clearCache(testName);
}

/** @knipignore part of worker API */
export function filterCached(testName: string, filePaths: BettererFilePaths): BettererFilePaths {
  checkInitialisedCache(cache);
  return cache.filterCached(testName, filePaths);
}

/** @knipignore part of worker API */
export function updateCache(testName: string, filePaths: BettererFilePaths): void {
  checkInitialisedCache(cache);
  cache.updateCache(testName, filePaths);
}

/** @knipignore part of worker API */
export function writeCache(): Promise<void> {
  checkInitialisedCache(cache);
  return cache.writeCache();
}

function checkInitialisedVersionControl(
  versionControl: BettererVersionControl | null
): asserts versionControl is BettererVersionControl {
  invariantΔ(versionControl, '`init` must be called before using version control!');
}

function checkInitialisedCache(cache: BettererFileCache | null): asserts cache is BettererFileCache {
  invariantΔ(cache, '`init` must be called before using cache!');
}

exposeToMainΔ({
  init,
  add,
  getFilePaths,
  sync,
  clearCache,
  filterCached,
  updateCache,
  writeCache
});
