import type { BettererWorkerAPI } from '@betterer/worker';

/**
 * @public A path to a {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file }
 * containing **Betterer** tests, or an array of them.
 */
export type BettererOptionsPaths = Array<string> | string;

/**
 * @public **Betterer** options for creating a `BettererFS`.
 *
 * @remarks The options object will be validated by **Betterer** and will be available on the
 * {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export interface BettererOptionsFS {
  /**
   * When `true`, caching will be enabled for {@link @betterer/betterer#BettererFileTest | `BettererFileTest`s}.
   * Betterer will only check files that have changes since the last test run. **Betterer** will
   * create a cache file at the `configPath`.
   * @defaultValue `false`
   */
  cache?: boolean;
  /**
   * The path to where the **Betterer** cache file will be saved. Only used when `cache` is `true`.
   * The `cachePath` should be relative to the `cwd`.
   * @defaultValue `'./.betterer.cache'`
   */
  cachePath?: string;
  /**
   * A path to a {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file }
   * containing **Betterer** tests, or an array of them. All `configPaths` should be relative to
   * the `cwd`.
   * @defaultValue `['./.betterer.ts']`
   */
  configPaths?: BettererOptionsPaths;
  /**
   * The current working directory.
   * @defaultValue {@link https://nodejs.org/api/process.html#process_process_cwd | `process.cwd()`}
   */
  cwd?: string;
  /**
   * The path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
   * The `resultsPath` should be relative to the `cwd`.
   * @defaultValue `'./.betterer.results'`
   */
  resultsPath?: string;
}

/**
 * @public An array of absolute {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file paths }
 * containing **Betterer** tests.
 */
export type BettererConfigPaths = ReadonlyArray<string>;

/**
 * @public Full validated config object for a `BettererFS`.
 *
 * @remarks Ths config can be accessed via the {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export interface BettererConfigFS {
  /**
   * When `true`, caching will be enabled for {@link @betterer/betterer#BettererFileTest | `BettererFileTest`s }.
   * **Betterer** will only check files that have changes since the last test run. **Betterer**
   * will create a cache file at the `configPath`.
   */
  cache: boolean;
  /**
   * The absolute path to where the **Betterer** cache file will be saved. Only used when `cache`
   * is `true`.
   */
  cachePath: string;
  /**
   * An array of absolute {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file paths }
   * containing **Betterer** tests.
   */
  configPaths: BettererConfigPaths;
  /**
   * The current working directory.
   */
  cwd: string;
  /**
   * The absolute path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
   */
  resultsPath: string;
}

/**
 * @public Options for when merging conflicts in the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}
 * via the {@link @betterer/betterer#merge | `betterer.merge()` API}.
 *
 * @remarks The options object will be validated by **Betterer**.
 */
export interface BettererOptionsMerge {
  /**
   * File contents for merging. If omitted, the `resultsPath` will be read and merged.
   */
  contents?: Array<string>;
  /**
   * The current working directory.
   * @defaultValue {@link https://nodejs.org/api/process.html#process_process_cwd | `process.cwd()` }
   */
  cwd?: string;
  /**
   * The path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
   * The `resultsPath` should be relative to the `cwd`.
   * @defaultValue `'./.betterer.results'`
   */
  resultsPath?: string;
}

export interface BettererConfigMerge {
  contents: Array<string>;
  /**
   * The current working directory.
   */
  cwd: string;
  /**
   * The absolute path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
   */
  resultsPath: string;
}

/**
 * @public An array of {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob }
 * patterns that match file paths that will be included in an operation. All globs should be
 * relative to the current {@link @betterer/betterer#BettererConfigFS.cwd | `BettererConfigFS.cwd`}.
 *
 * @remarks - Can contain nested arrays, which will be {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat | flattened}.
 */
export type BettererFileGlobs = ReadonlyArray<string | ReadonlyArray<string>>;

/**
 * @public The path to a file on disk.
 */
export type BettererFilePath = string;

/**
 * @public An array of paths to files on disk.
 */
export type BettererFilePaths = ReadonlyArray<BettererFilePath>;

/**
 * @public An array of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expressions }
 * that match file paths that will be excluded from an operation.
 *
 * @remarks - Can contain nested arrays, which will be {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat | flattened}.
 */
export type BettererFilePatterns = ReadonlyArray<RegExp | ReadonlyArray<RegExp>>;

/** @knipignore used by an exported function */
export type BettererFileHashMap = Map<string, string>;
/** @knipignore used by an exported function */
export type BettererFileHashMapSerialised = Record<string, string>;

/** @knipignore used by an exported function */
export type BettererTestCacheMap = Map<string, BettererFileHashMap>;
/** @knipignore used by an exported function */
export type BettererTestCacheMapSerialised = Record<string, BettererFileHashMapSerialised>;

/** @knipignore used by an exported function */
export interface BettererCacheFile {
  version: number;
  testCache: BettererTestCacheMapSerialised;
}

/** @knipignore used by an exported function */
export interface BettererFileCache {
  clearCache(testName: string): void;
  filterCached(testName: string, filePaths: BettererFilePaths): BettererFilePaths;
  enableCache(cachePath: string): Promise<void>;
  updateCache(testName: string, filePaths: BettererFilePaths): void;
  writeCache(): Promise<void>;
}

/** @knipignore used by an exported function */
export interface BettererVersionControl extends BettererFileCache {
  add(resultsPath: string): Promise<void>;
  filterIgnored(filePaths: BettererFilePaths): BettererFilePaths;
  getFilePaths(): BettererFilePaths;
  init(configPaths: BettererFilePaths, cwd: string): Promise<string>;
  sync(): Promise<void>;
}

export type BettererVersionControlWorker = BettererWorkerAPI<BettererVersionControl>;

/**
 * @public A helper for resolving file paths in a {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest`}.
 *
 * @remarks For ergonomic reasons, a test consumer should be able to use _relative_ paths when they
 * use a test, whether that be passing the path to a config file, or using {@link @betterer/betterer#BettererResolverTest.include | `BettererResolverTest.include()` }
 * to select relevant files.
 *
 * To enable that, **Betterer** creates a `BettererFileResolver` whenever a {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest` }
 * is run. The `baseDirectory` is set to the directory containing the {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file}.
 *
 * Internally **Betterer** uses the `BettererFileResolver` to manage file paths specified by
 * {@link @betterer/betterer#BettererResolverTest.include | `BettererResolverTest.include()` } and {@link @betterer/betterer#BettererResolverTest.exclude | `BettererResolverTest.exclude` }.
 * A test function can use the `BettererFileResolver` to resolve and validate file paths.
 *
 * @example
 * ```typescript
 * import { BettererResolverTest } from '@betterer/betterer';
 *
 * export function myTest (relativeConfigFilePath: string) {
 *   return new BettererResolverTest({
 *     constraint: () => {
 *       // ...
 *     },
 *     test: () => {
 *       // Resolve a file path relative to the `baseDirectory`
 *       const absoluteConfigFilePath = this.resolver.resolve(relativeConfigFilePath);
 *
 *       // Validate if some file paths are relevant for a test:
 *       const validatedPaths = this.resolver.validate(
 *         ['./file-1.js', './file-2.js', './file-3.ts']
 *       );
 *        // ['./file-1.js']
 *     }
 *   })
 *   .include('**\/*.js')
 *   .exclude(/file-2.js/);
 * };
 * ```
 */
export interface BettererFileResolver {
  /**
   * The direction from which all file paths are resolved.
   */
  readonly baseDirectory: string;
  /**
   * Resolve a file path relative to the `baseDirectory`.
   *
   * @param pathSegments - String path segments to resolve. Works the same was as {@link https://nodejs.org/api/path.html#pathresolvepaths | 'path.resolve()' }
   * but with `baseDirectory` as the first argument.
   *
   * @returns The resolved path.
   */
  resolve(...pathSegments: Array<string>): string;
  /**
   * Find the relative path to `to` from the `baseDirectory`.
   *
   * @param to - String path of the target file/directory. Works the same was as {@link https://nodejs.org/api/path.html#pathrelativefrom-to | 'path.relative()' }
   * but with `to` as the first argument.
   *
   * @returns The relative path.
   */
  relative(to: string): string;
  /**
   * Check if some file paths are included and valid based on the resolver config. Files can be included and excluded
   * via {@link @betterer/betterer#BettererResolverTest.include | `BettererResolverTest.include()`} and {@link @betterer/betterer#BettererResolverTest.exclude | `BettererResolverTest.exclude()`}.
   *
   * @remarks Also takes into consideration the files status in the version control system,
   * so a given file path *must* exist on disk, *and* not be listed in an ignore file.
   *
   * @param filePaths - An array of paths to validate.
   *
   * @returns The given paths filtered for relevance based on the `includes` and `excludes` of the {@link @betterer/betterer#BettererFileResolver | `BettererFileResolver`},
   * as well as the files status in the version control system.
   */
  validate(filePaths: BettererFilePaths): Promise<BettererFilePaths>;
  /**
   * Check if some file paths are included and valid based on the resolver config. Files can be included and excluded
   * via {@link @betterer/betterer#BettererResolverTest.include | `BettererResolverTest.include()`} and {@link @betterer/betterer#BettererResolverTest.exclude | `BettererResolverTest.exclude()`}.
   *
   * @param filePaths - An array of paths to validate.
   *
   * @returns The given paths filtered for relevance based on the `includes` and `excludes` of the {@link @betterer/betterer#BettererFileResolver | `BettererFileResolver`}.
   */
  included(filePaths: BettererFilePaths): BettererFilePaths;
  /**
   * Create a temporary file and get the path to that file, relative to the `baseDirectory`.
   *
   * @param filePath - an optional file path to include in the temp path.
   *
   * @returns A path to a temporary directory called `.betterer` somewhere on disk, with the optional file path.
   * If included, the file path will have extra characters inserted to guarantee uniqueness.
   */
  tmp(filePath?: BettererFilePath): Promise<BettererFilePath>;
}
