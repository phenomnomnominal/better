import type { BettererFilePaths, BettererFileResolver } from '../../fs/index.js';
import type { MaybeAsync } from '../../types.js';
import type { BettererDiff } from '../types.js';

/**
 * @public A serialised {@link @betterer/betterer#BettererFileIssue | `BettererFileIssue`}.
 */
export type BettererFileIssueSerialised = [line: number, column: number, length: number, message: string, hash: string];

/**
 * @public An array of {@link @betterer/betterer#BettererFileIssueSerialised | `BettererFileIssueSerialised`s}.
 */
export type BettererFileIssuesSerialised = ReadonlyArray<BettererFileIssueSerialised>;

/**
 * @internal This could change at any point! Please don't use!
 *
 * The properties that create a key for a specific issue on a serialised BettererFileTestResult
 */
export interface BettererFileTestResultKeyParts {
  relativePath: string;
  hash: string;
}

/**
 * @public A lookup key for a specific issue on a serialised BettererFileTestResult
 */
export type BettererFileTestResultKey = `${string}:${string}`;

/**
 * @public A map from file path to {@link @betterer/betterer#BettererFileIssuesSerialised | `BettererFileIssuesSerialised`}.
 */
export type BettererFileTestResultSerialised = Record<BettererFileTestResultKey, BettererFileIssuesSerialised>;

/**
 * @public A diff object for a single file.
 */
export interface BettererFileDiff {
  /**
   * The list of issues that have been fixed since the last run.
   */
  fixed?: BettererFileIssuesSerialised;
  /**
   * The list of issues that have not changed since the last run.
   */
  existing?: BettererFileIssuesSerialised;
  /**
   * The list of new issues since the last run.
   */
  new?: BettererFileIssuesSerialised;
}

/**
 * @public A map from file path to {@link @betterer/betterer#BettererFileDiff | `BettererFileDiff`}.
 */
export type BettererFilesDiff = Record<string, BettererFileDiff>;

/**
 * @public A diff object for a complete {@link @betterer/betterer#BettererFileTest | `BettererFileTest`} run.
 */
export type BettererFileTestDiff = BettererDiff<BettererFilesDiff>;

/**
 * @public A function that runs an actual file test.
 *
 * @param filePaths - The relevant file paths for this test run. Determined by taking the input file
 * paths (defined by Watch mode or the {@link @betterer/betterer#BettererConfig | global `includes`/`excludes` config})
 * and then validating them with the test {@link @betterer/betterer#BettererResolverTest.include | `BettererResolverTest.include()` }
 * and {@link @betterer/betterer#BettererResolverTest.exclude | `BettererResolverTest.exclude()` }.
 * @param fileTestResult - The {@link @betterer/betterer#BettererFileTestResult | `result`} for this test.
 * @param resolver - The {@link @betterer/betterer#BettererFileResolver | `resolver`} for this test.
 */
export type BettererFileTestFunction = (
  filePaths: BettererFilePaths,
  fileTestResult: BettererFileTestResult,
  resolver: BettererFileResolver
) => MaybeAsync<void>;

/**
 * @public An issue in a file
 */
export interface BettererFileIssue {
  /**
   * The `0`-indexed line number of the issue in the file.
   */
  readonly line: number;
  /**
   * The `0`-indexed column number in the line that has an issue.
   */
  readonly column: number;
  /**
   * The length of the substring that caused the issue.
   */
  readonly length: number;
  /**
   * A message that describes the issue.
   */
  readonly message: string;
  /**
   * A hash for the issue (usually the hash of the `message`). The `hash` is used for tracking
   * issues as they move around within a file.
   */
  readonly hash: string;
}

/**
 * @public An array of {@link @betterer/betterer#BettererFileIssue | `BettererFileIssue`s}.
 */
export type BettererFileIssues = ReadonlyArray<BettererFileIssue>;

/**
 * @public Basic information about a file and its issues.
 */
export interface BettererFileBase {
  /**
   * The absolute path to the file.
   */
  readonly absolutePath: string;
  /**
   * The hash for the file (usually the hash of the file contents). The `hash` is used for tracking
   * files as they move around within a codebase.
   */
  readonly hash: string;
  /**
   * The set of issues for the file.
   */
  readonly issues: BettererFileIssues;
  /**
   * The key used for identifying the file in the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
   */
  readonly key: BettererFileTestResultKey;
}

/**
 * @public Basic information about a file and its issues.
 */
export interface BettererFile extends BettererFileBase {
  /**
   * Add an issue to the file from start and end indices in the file contents string.
   *
   * @param start - The start index of the issue.
   * @param end - The end index of the issue.
   * @param message - A message that describes the issue.
   * @param hash - A hash for the issue. If omitted, the hash of `message` will be used.
   */
  addIssue(start: number, end: number, message: string, hash?: string): void;
  /**
   * Add an issue to the file from start line/column position and length.
   *
   * @param line - The `0`-indexed line number of the start of the issue in the file.
   * @param col - The `0`-indexed column number of the start of the issue in the line.
   * @param length - The length of the substring that caused the issue.
   * @param message - A message that describes the issue.
   * @param hash - A hash for the issue. If omitted, the hash of `message` will be used.
   */
  addIssue(line: number, col: number, length: number, message: string, hash?: string): void;
  /**
   * Add an issue to the file from start line/column position and end line/column position.
   *
   * @param startLine - The `0`-indexed line number of the start of the issue in the file.
   * @param startCol - The `0`-indexed column number of the start of the issue in the line.
   * @param endLine - The `0`-indexed line number of the end of the issue in the file.
   * @param endCol - The `0`-indexed column number of the end of the issue in the line.
   * @param message - A message that describes the issue.
   * @param hash - A hash for the issue. If omitted, the hash of `message` will be used.
   */
  addIssue(startLine: number, startCol: number, endLine: number, endCol: number, message: string, hash?: string): void;
}

/**
 * @public A set of {@link @betterer/betterer#BettererFile | `BettererFile`s} which each have their
 * own set of {@link @betterer/betterer#BettererFileIssues | `BettererFileIssues`}.
 *
 * @remarks `DeserialisedType` of a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`}.
 */
export interface BettererFileTestResult {
  /**
   * Add a new file to the result set.
   *
   * @param absolutePath - The absolute path to the file.
   * @param fileText - The current text content of the file.
   */
  addFile(absolutePath: string, fileText: string): BettererFile;
  /**
   * Get the set of {@link @betterer/betterer#BettererFileIssues | `BettererFileIssues`} for a file
   * at the given path.
   *
   * @param absolutePath - The absolute path to the file. If not present, will return all issues for
   * all files.
   */
  getIssues(absolutePath?: string): BettererFileIssues;
}
