import type { BettererCoverageTest } from './types.js';

import { BettererCoverageTestΩ } from './coverage-test.js';
import { test, testTotal } from './test.js';

/**
 * @public
 * Use this test to track your per-file test coverage. Reads a {@link https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-reports/lib/json-summary/index.js | json-summary format}
 * coverage summary. Make sure to run your tests separately before running Betterer.
 *
 * @param coverageSummaryPath - relative path to the coverage summary. Defaults to `'./coverage/coverage-summary.json'`.
 */
export function coverage(coverageSummaryPath?: string): BettererCoverageTest {
  return new BettererCoverageTestΩ(test, coverageSummaryPath);
}

/**
 * @public
 * Use this test to track your total test coverage. Reads a {@link https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-reports/lib/json-summary/index.js | json-summary format}
 * coverage summary. Make sure to run your tests separately before running Betterer.
 *
 * @param coverageSummaryPath - relative path to the coverage summary. Defaults to `'./coverage/coverage-summary.json'`.
 */
export function coverageTotal(coverageSummaryPath?: string): BettererCoverageTest {
  return new BettererCoverageTestΩ(testTotal, coverageSummaryPath);
}
