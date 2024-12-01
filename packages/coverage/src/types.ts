import type { BettererFileResolver, BettererResolverTest } from '@betterer/betterer';
import type { CoverageSummaryData, Totals } from 'istanbul-lib-coverage';

export type IstanbulCoverage = Totals;
export type IstanbulFileCoverage = CoverageSummaryData;
export type IstanbulCoverageSummary = Record<string, IstanbulFileCoverage>;

/**
 * @public A {@link @betterer/betterer#BettererTest | `BettererTest`} to incrementally improve test coverage.
 */
export type BettererCoverageTest = BettererResolverTest<
  BettererCoverageIssues,
  BettererCoverageIssues,
  BettererCoverageDiff
>;

export type BettererCoverageTestFunction = (
  relativeCoverageReportPath: string,
  resolver: BettererFileResolver
) => Promise<BettererCoverageIssues>;

/**
 * @public The different types of coverage which are checked.
 */
export type BettererCoverageTypes = 'lines' | 'statements' | 'functions' | 'branches';

/**
 * @public The lines, statements, functions and branches coverage for a file (or the total project).
 *
 * @remarks Each value indicates how many of each type remain uncovered in the file.
 */
export type BettererCoverageIssue = Record<BettererCoverageTypes, number>;

/**
 * @public The coverage for all the files in a project.
 */
export type BettererCoverageIssues = Record<string, BettererCoverageIssue>;

/**
 * @public The difference in coverage for a project between two test runs.
 */
export type BettererCoverageDiff = BettererCoverageIssues;
