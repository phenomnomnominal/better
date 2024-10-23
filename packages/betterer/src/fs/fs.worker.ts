import type { BettererConfig } from '../config/index.js';
import type { BettererTestMeta } from '../test/index.js';
import type { BettererFileCache, BettererFilePaths, BettererFS, BettererVersionControl } from './types.js';

import { invariantΔ } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';

import { BettererGitΩ } from './git.js';
import { BettererFileCacheΩ } from './file-cache.js';
import { BettererFSΩ } from './fs.js';

let fs: BettererFS | null = null;
let versionControl: BettererVersionControl | null = null;
let cache: BettererFileCache | null = null;

/** @knipignore part of worker API */
export async function init(config: BettererConfig): Promise<void> {
  fs = await BettererFSΩ.create(config.basePath);
  if (config.cache) {
    cache = await BettererFileCacheΩ.create(config.cachePath);
  }
  if (config.precommit && config.versionControlPath) {
    versionControl = new BettererGitΩ(config.versionControlPath);
  }
}

/** @knipignore part of worker API */
export function add(resultsPath: string): Promise<void> {
  checkInitialisedVersionControl(versionControl);
  return versionControl.add(resultsPath);
}

/** @knipignore part of worker API */
export function getFilePaths(): BettererFilePaths {
  checkInitialisedFS(fs);
  return fs.getFilePaths();
}

/** @knipignore part of worker API */
export function sync(): Promise<void> {
  checkInitialisedFS(fs);
  return fs.sync();
}

/** @knipignore part of worker API */
export function clearCache(testName: string): void {
  checkInitialisedCache(cache);
  cache.clearCache(testName);
}

/** @knipignore part of worker API */
export function filterCached(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<BettererFilePaths> {
  checkInitialisedCache(cache);
  return cache.filterCached(testMeta, filePaths);
}

/** @knipignore part of worker API */
export async function updateCache(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<void> {
  checkInitialisedCache(cache);
  await cache.updateCache(testMeta, filePaths);
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

function checkInitialisedFS(fs: BettererFS | null): asserts fs is BettererFS {
  invariantΔ(fs, '`init` must be called before using file system!');
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
