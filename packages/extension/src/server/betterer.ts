import type { betterer, BettererOptionsRunner, BettererRunner } from '@betterer/betterer';

import { Files } from 'vscode-languageserver/node';

import { nodeRequire } from '../utils.js';
import { trace } from './trace.js';

type BettererLibrary = typeof betterer;
interface BettererModule {
  betterer: BettererLibrary;
}

const PATH_TO_LIB = new Map<string, BettererLibrary>();
const RUNNERS = new Map<string, BettererRunner>();

export async function hasBetterer(cwd: string): Promise<boolean> {
  const libraryPath = await getLibraryPath(cwd);
  return !!libraryPath;
}

export async function getRunner(cwd: string, options: BettererOptionsRunner): Promise<BettererRunner> {
  const key = JSON.stringify(options);
  const existingRunner = RUNNERS.get(key);
  if (existingRunner) {
    return existingRunner;
  }
  const { runner } = await getLibrary(cwd);
  const toCache = await runner(options);
  RUNNERS.set(key, toCache);
  return toCache;
}

async function getLibraryPath(cwd: string): Promise<string> {
  return await Files.resolve('@betterer/betterer', undefined, cwd, trace);
}

async function getLibrary(cwd: string): Promise<BettererLibrary> {
  const existingLibrary = PATH_TO_LIB.get(cwd);
  if (existingLibrary) {
    return existingLibrary;
  }
  const libraryPath = await getLibraryPath(cwd);
  const r = nodeRequire();
  const library = r(libraryPath) as BettererModule;
  const bettererLibrary = library.betterer;
  PATH_TO_LIB.set(cwd, bettererLibrary);
  return bettererLibrary;
}
