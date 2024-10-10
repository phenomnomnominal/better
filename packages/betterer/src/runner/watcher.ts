import type { FSWatcher } from 'chokidar';

import { watch } from 'chokidar';
import minimatch from 'minimatch';
import path from 'node:path';

import { isTempFilePath } from '../fs/index.js';
import { getGlobals } from '../globals.js';
import { normalisedPath } from '../utils.js';

export const WATCHER_EVENTS = ['add', 'change'];

export async function createWatcher(): Promise<FSWatcher | null> {
  const { config } = getGlobals();
  if (!config.watch) {
    return null;
  }

  const { cachePath, cwd, resultsPath } = config;

  const watcher = watch(cwd, {
    ignoreInitial: true,
    ignored: (itemPath: string) => {
      itemPath = normalisedPath(itemPath);
      const isCwd = itemPath === normalisedPath(cwd);
      if (isCwd) {
        return false;
      }

      const isGitPath = itemPath.includes('.git');
      const isResultsPath = itemPath === normalisedPath(resultsPath);
      const isCachePath = itemPath === normalisedPath(cachePath);
      const isTempPath = isTempFilePath(itemPath);
      if (isGitPath || isResultsPath || isCachePath || isTempPath) {
        return true;
      }

      // read `ignores` here so that it can be updated by watch mode:
      const { ignores } = config;
      const watchIgnores = ignores.map((ignore) => path.join(cwd, ignore));
      const isIgnored = watchIgnores.some((ignore) => minimatch(itemPath, ignore, { matchBase: true }));
      return isIgnored;
    }
  });

  await new Promise((resolve, reject) => {
    watcher.on('ready', resolve);
    watcher.on('error', reject);
  });

  return watcher;
}
