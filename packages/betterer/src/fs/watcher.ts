import type { FSWatcher } from 'chokidar';

import { watch } from 'chokidar';

import { getGlobals } from '../globals.js';

export const WATCHER_EVENTS = ['add', 'change'];

export async function createWatcher(): Promise<FSWatcher | null> {
  const { config } = getGlobals();
  if (!config.watch) {
    return null;
  }

  const watcher = watch(config.basePath, { ignoreInitial: true });

  await new Promise((resolve, reject) => {
    watcher.on('ready', resolve);
    watcher.on('error', reject);
  });

  return watcher;
}
