import type { BettererTestMeta } from '../test/index.js';
import type {
  BettererFileGlobs,
  BettererFilePath,
  BettererFilePaths,
  BettererFilePatterns,
  BettererFileResolver
} from './types.js';

import minimatch from 'minimatch';
import path from 'node:path';

import { getGlobals } from '../globals.js';
import { flatten, isString, normalisedPath } from '../utils.js';
import { BettererCacheStrategy } from './file-cache-strategy.js';
import { getTmpPath } from './temp.js';

const INCLUDE_ALL = '**/*';
export class BettererFileResolverΩ implements BettererFileResolver {
  private _cacheStrategy: BettererCacheStrategy | null = null;
  private _excluded: Array<RegExp | string> = [];
  private _excludedResolved: Array<RegExp | string> | null = null;
  private _included: Array<string> = [INCLUDE_ALL];
  private _includedResolved: Array<string> | null = null;
  private _validatedFilePaths: Array<string> = [];
  private _validatedFilePathsMap: Record<string, boolean> = {};

  constructor(public readonly baseDirectory: string) {}

  public get isCacheable(): boolean {
    return this._cacheStrategy !== null;
  }

  public cache(strategy: BettererCacheStrategy): void {
    this._cacheStrategy = strategy;
  }

  public async validate(filePaths: BettererFilePaths): Promise<BettererFilePaths> {
    if (!filePaths.length) {
      return filePaths;
    }

    await this._update();
    return filePaths.filter((filePath) => this._validatedFilePathsMap[filePath]);
  }

  public included(filePaths: BettererFilePaths): BettererFilePaths {
    if (!this._included.length) {
      return filePaths;
    }
    return filePaths.filter((filePath) => this._isIncluded(filePath) && !this._isExcluded(filePath));
  }

  public resolve(...pathSegments: Array<string>): string {
    return normalisedPath(path.resolve(this.baseDirectory, ...pathSegments));
  }

  public relative(to: string): string {
    return normalisedPath(path.relative(this.baseDirectory, to));
  }

  public include(...includePatterns: BettererFileGlobs): this {
    if (!includePatterns.length) {
      return this;
    }

    if (this._included.length === 1 && this._included.includes(INCLUDE_ALL)) {
      this._included = [];
    }

    this._included = [...this._included, ...flatten(includePatterns)];
    this._includedResolved = null;
    return this;
  }

  public exclude(...excludePatterns: BettererFilePatterns): this {
    this._excluded = [...this._excluded, ...flatten(excludePatterns)];
    this._excludedResolved = null;
    return this;
  }

  public async files(): Promise<BettererFilePaths> {
    await this._update();
    return this._validatedFilePaths;
  }

  public async filterCached(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<BettererFilePaths> {
    const { fs } = getGlobals();

    // If file changes do not impact other files e.g. linting, RegExp/syntax checks,
    if (this._cacheStrategy === BettererCacheStrategy.FilePath) {
      // then only changed files need to be tested:
      const cacheMisses = await fs.api.filterCached(testMeta, filePaths);
      return cacheMisses;
    }

    // If file changes might impact another file: e.g. full compilation
    if (this._cacheStrategy === BettererCacheStrategy.FilePaths) {
      // Then it's all or nothing:
      const cacheMisses = await fs.api.filterCached(testMeta, await this.files());
      const allFilesCached = cacheMisses.length === 0;
      return allFilesCached ? [] : filePaths;
    }

    return filePaths;
  }

  public async tmp(filePath = ''): Promise<BettererFilePath> {
    const tmpPath = await getTmpPath(filePath);
    return this.relative(tmpPath);
  }

  private async _update(): Promise<void> {
    const { fs } = getGlobals();

    this._validatedFilePathsMap = {};
    const filePaths = await fs.api.getFilePaths();
    const validatedFilePaths: Array<string> = [];
    filePaths.forEach((filePath) => {
      const includedAndNotExcluded = this._isIncluded(filePath) && !this._isExcluded(filePath);
      this._validatedFilePathsMap[filePath] = includedAndNotExcluded;
      if (includedAndNotExcluded) {
        validatedFilePaths.push(filePath);
      }
    });
    this._validatedFilePaths = validatedFilePaths.sort();
  }

  private _isIncluded(filePath: string): boolean {
    if (!this._includedResolved) {
      this._includedResolved = this._included.map((pattern) => this.resolve(pattern));
    }
    return this._includedResolved.some((pattern) => minimatch(filePath, pattern));
  }

  private _isExcluded(filePath: string): boolean {
    if (!this._excludedResolved) {
      this._excludedResolved = this._excluded.map((pattern) => (isString(pattern) ? this.resolve(pattern) : pattern));
    }
    return this._excluded.some((pattern) =>
      isString(pattern) ? minimatch(filePath, pattern) : pattern.test(filePath)
    );
  }
}
