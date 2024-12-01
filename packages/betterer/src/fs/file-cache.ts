import type { BettererTestMeta } from '../test/index.js';
import type {
  BettererCacheFile,
  BettererFileCache,
  BettererFilePaths,
  BettererFileHashMap,
  BettererFileHashMapSerialised,
  BettererTestCacheMap,
  BettererTestCacheMapSerialised,
  BettererFilePath
} from './types.js';

import { invariantΔ } from '@betterer/errors';
import path from 'node:path';
import { normalisedPath, sortEntriesKeys } from '../utils.js';
import { read } from './reader.js';
import { write } from './writer.js';
import { createCacheHash } from '../hasher.js';

const BETTERER_CACHE_VERSION = 2;

// The BettererFileCacheΩ is a simple JSON cache of test + file data.
// Each test has it's own cache entry, which is a list of hashes:
//
// {
//   "version": 2,
//   "testCache": {
//     "test name": {
//        "relative file path": "hash",
//        "another relative file path": "another hash"
//        ...
//     }
//   }
// }
//
// Each stored hash is the hash of contents of that path at the point it is written.
// It is written each time a test runs on a given file and the file gets better, stays the same,
// or gets updated. If the hash hasn't changed, then the file hasn't changed, so running the test on the file again
// *should* have the same result.
//
// Of course the actual test itself could have changed so ... 🤷‍♂️

export class BettererFileCacheΩ implements BettererFileCache {
  private _fileHashMap: BettererFileHashMap = new Map();
  private _memoryCacheMap: BettererTestCacheMap = new Map();

  private constructor(
    private _cachePath: string,
    cacheJson: string | null
  ) {
    this._memoryCacheMap = this._readCache(cacheJson);
  }

  public static async create(cachePath: string): Promise<BettererFileCacheΩ> {
    return new BettererFileCacheΩ(cachePath, await read(cachePath));
  }

  public clearCache(testName: string): void {
    this._memoryCacheMap.delete(testName);
  }

  public async writeCache(): Promise<void> {
    // Clean up any expired cache entries before writing to disk:
    [...this._memoryCacheMap.entries()].forEach(([, fileHashMap]) => {
      [...fileHashMap.entries()].forEach(([filePath]) => {
        const hash = this._fileHashMap.get(filePath);
        if (hash == null) {
          this._memoryCacheMap.delete(filePath);
        }
      });
    });

    // Convert Map to Record so it can be serialised to disk:
    const relativeTestCache: BettererTestCacheMapSerialised = {};
    [...this._memoryCacheMap.entries()].sort(sortEntriesKeys).forEach(([testName, absoluteFileHashMap]) => {
      const relativeFileHashMap: BettererFileHashMapSerialised = {};
      [...absoluteFileHashMap.entries()]
        .map(([absoluteFilePath, hash]): [string, string] => {
          const relativePath = normalisedPath(path.relative(path.dirname(this._cachePath), absoluteFilePath));
          return [relativePath, hash] as [string, string];
        })
        .sort(sortEntriesKeys)
        .forEach(([relativePath, hash]) => {
          relativeFileHashMap[relativePath] = hash;
        });
      relativeTestCache[testName] = relativeFileHashMap;
    });
    const cache = { version: BETTERER_CACHE_VERSION, testCache: relativeTestCache };
    const cacheString = JSON.stringify(cache, null, '  ');
    await write(cacheString, this._cachePath);
  }

  public async filterCached(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<BettererFilePaths> {
    const { name } = testMeta;
    const testCache = this._memoryCacheMap.get(name) ?? (new Map() as BettererTestCacheMap);

    const configHash = testCache.get(testMeta.configPath);
    if (configHash !== testMeta.configHash) {
      return filePaths;
    }

    const cacheMisses: Array<BettererFilePath> = [];
    await Promise.all(
      filePaths.map(async (filePath) => {
        const contents = await read(filePath);
        if (contents == null) {
          return;
        }
        const hash = createCacheHash(contents);
        const previousHash = testCache.get(filePath);
        if (hash !== previousHash) {
          cacheMisses.push(filePath);
        }
      })
    );
    return cacheMisses;
  }

  public async updateCache(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<void> {
    const { name } = testMeta;
    if (!this._memoryCacheMap.get(name)) {
      this._memoryCacheMap.set(name, new Map());
    }

    const testCache = this._memoryCacheMap.get(name);
    invariantΔ(testCache, '`testCache` entry should have been validated above!', testCache);

    const existingFilePaths = [...testCache.keys()];
    const cacheFilePaths = Array.from(new Set([...existingFilePaths, ...filePaths])).sort();

    const updatedCache: BettererFileHashMap = new Map();
    await Promise.all(
      cacheFilePaths.map(async (filePath) => {
        const contents = await read(filePath);
        if (contents === null) {
          return;
        }

        const hash = createCacheHash(contents);
        updatedCache.set(filePath, hash);
      })
    );

    updatedCache.set(testMeta.configPath, testMeta.configHash);

    this._memoryCacheMap.set(name, updatedCache);
  }

  private _readCache(cacheJSON: string | null): BettererTestCacheMap {
    if (!cacheJSON) {
      return new Map();
    }

    const parsed = JSON.parse(cacheJSON) as BettererCacheFile;
    const { version } = parsed;
    if (!version) {
      return new Map();
    }

    // Transform serialised Record with relative paths back into
    // Map with absolute paths:
    const absoluteTestCacheMap: BettererTestCacheMap = new Map();
    Object.entries(parsed.testCache).forEach(([testName, serialisedEntries]) => {
      const absoluteFileHashMap: BettererFileHashMap = new Map();
      Object.entries(serialisedEntries).forEach(([relativePath, hash]) => {
        invariantΔ(this._cachePath, `\`this._cachePath\` should have been validated above!`, this._cachePath);
        const absolutePath = normalisedPath(path.resolve(path.dirname(this._cachePath), relativePath));
        absoluteFileHashMap.set(absolutePath, hash);
      });
      absoluteTestCacheMap.set(testName, absoluteFileHashMap);
    });
    return absoluteTestCacheMap;
  }
}
