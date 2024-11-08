import type { BettererWorkerAPI } from '@betterer/worker';

import type { BettererFileIssues } from '../test/index.js';

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
 * @public The deserialised result object for a single run of a single {@link @betterer/betterer#BettererTest | `BettererTest`}.
 *
 * @remarks Having a wrapper like this is useful to distinguish between no result (`null`),
 * and a test that had a null result `{ value: null }`.
 */
export interface BettererResult {
  /**
   * The actual value of the result.
   *
   * @remarks could be anything, including `null`!
   */
  value: unknown;
}

/**
 * @knipignore used by an exported function
 *
 * The result object for a single run of a single {@link @betterer/betterer#BettererTest | `BettererTest`}.
 * The `value` is first serialised and then `JSON.stringify()`-ed, so it needs
 * to be `JSON.parse()`-ed and then deserialised to be useful.
 */
export interface BettererResultSerialised {
  value: string;
}

/**
 * The results object for a single run of a suite of {@link @betterer/betterer#BettererTest | `BettererTest`-s}.
 * Each key is the `name` of a test, and the value is the {@link BettererResult | serialised result}.
 */
export type BettererResultsSerialised = Record<string, BettererResultSerialised>;

/**
 * @public A summary of the results of the defined {@link @betterer/betterer#BettererTest | `BettererTest`s}.
 *
 * @remarks The result of calling {@link @betterer/betterer#results | `betterer.results()`}.
 */
export interface BettererResultsSummary {
  /**
   * An array containing a {@link @betterer/betterer#BettererResultSummary | `BettererResultSummary`}
   * for each test in the {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file}.
   */
  resultSummaries: BettererResultSummaries;
}

/**
 * @public An array of {@link @betterer/betterer#BettererResultSummary | `BettererResultSummary`}.
 */
export type BettererResultSummaries = ReadonlyArray<BettererResultSummary>;

/**
 * @public The summary of the result of a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`}.
 */
export interface BettererFileTestResultSummary {
  /**
   * The name of the test.
   */
  name: string;
  /**
   * Specifies that the test is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`}.
   */
  isFileTest: true;
  /**
   * The result of the test. A mapping from the path to a file to an array of {@link @betterer/betterer#BettererFileIssues | `BettererFileIssues`}.
   */
  details: BettererFileTestResultSummaryDetails;
}

/**
 * @public The summary of the result of a {@link @betterer/betterer#BettererTest | `BettererTest`}.
 */
export interface BettererTestResultSummary {
  /**
   * The name of the test.
   */
  name: string;
  /**
   * Specifies that the test is a {@link @betterer/betterer#BettererTest | `BettererTest`}.
   */
  isFileTest: false;
  /**
   * The printed result of the test.
   */
  details: BettererTestResultSummaryDetails;
}

/**
 * @public The summary of the result of a {@link @betterer/betterer#BettererTest | `BettererTest`}
 * or {@link @betterer/betterer#BettererFileTest | `BettererFileTest`}.
 */
export type BettererResultSummary = BettererTestResultSummary | BettererFileTestResultSummary;

/**
 * @public The summarised result of a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`}.
 * A mapping from the path to a file to an array of {@link @betterer/betterer#BettererFileIssues | `BettererFileIssues`}.
 */
export type BettererFileTestResultSummaryDetails = Record<string, BettererFileIssues>;

/**
 * @public The summarised result of a {@link @betterer/betterer#BettererTest | `BettererTest`}.
 */
export type BettererTestResultSummaryDetails = string;

export type BettererResultsWorker = BettererWorkerAPI<typeof import('./results.worker.js')>;
