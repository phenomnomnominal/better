import type { BettererDiff, BettererRun } from '@betterer/betterer';
import type { BettererLogger } from '@betterer/logger';

import type { BettererCoverageDiff, BettererCoverageIssue, BettererCoverageIssues } from './types.js';

export async function differ(
  this: BettererRun,
  expected: BettererCoverageIssues,
  result: BettererCoverageIssues
): Promise<BettererDiff<BettererCoverageDiff>> {
  const diff: BettererCoverageDiff = {
    ...(await detectNewOrUpdatedFiles(expected, result, this.logger)),
    ...(await detectRemovedFiles(expected, result, this.logger))
  };
  return {
    diff
  };
}

async function detectNewOrUpdatedFiles(
  expected: BettererCoverageIssues,
  result: BettererCoverageIssues,
  logger: BettererLogger
): Promise<BettererCoverageDiff> {
  const diff: BettererCoverageDiff = {};
  await Promise.all(
    Object.entries(result).map(async ([filePath, issue]) => {
      if (expected[filePath]) {
        diff[filePath] = await diffFileIssue(expected[filePath], issue, filePath, logger);
      } else {
        await logger.debug(`new file: ${filePath}`);
        diff[filePath] = issue;
      }
    })
  );
  return diff;
}

async function diffFileIssue(
  expected: BettererCoverageIssue,
  result: BettererCoverageIssue,
  filePath: string,
  logger: BettererLogger
): Promise<BettererCoverageIssue> {
  const fileDiff: BettererCoverageIssue = {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0
  };
  const coverageTypes = Object.keys(fileDiff) as Array<keyof BettererCoverageIssue>;
  await Promise.all(
    coverageTypes.map(async (attribute: keyof BettererCoverageIssue) => {
      const resultValue = result[attribute];
      const expectedValue = expected[attribute];
      const delta = resultValue - expectedValue;
      if (delta < 0) {
        await logger.debug(
          `"${attribute}" coverage is better in "${filePath}": ${String(result[attribute])} < ${String(expected[attribute])}`
        );
      } else if (delta > 0) {
        await logger.error(
          `"${attribute}" coverage is worse in "${filePath}": ${String(result[attribute])} > ${String(expected[attribute])}`
        );
      }
      fileDiff[attribute] = delta;
    })
  );
  return fileDiff;
}

async function detectRemovedFiles(
  expected: BettererCoverageIssues,
  result: BettererCoverageIssues,
  logger: BettererLogger
): Promise<BettererCoverageDiff> {
  const diff: BettererCoverageDiff = {};
  await Promise.all(
    Object.entries(expected).map(async ([expectedFile, issues]) => {
      if (!result[expectedFile]) {
        await logger.debug(`${expectedFile} is gone.`);
        diff[expectedFile] = getNegativeIssue(issues);
      }
    })
  );
  return diff;
}

function getNegativeIssue(issue: BettererCoverageIssue): BettererCoverageIssue {
  return {
    branches: -issue.branches,
    lines: -issue.lines,
    functions: -issue.functions,
    statements: -issue.statements
  };
}
