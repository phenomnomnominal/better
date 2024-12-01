import type { BettererRun } from '@betterer/betterer';
import type { BettererCoverageDiff, BettererCoverageIssues } from './types.js';

import { BettererConstraintResult } from '@betterer/constraints';

import { differ } from './differ.js';

export async function constraint(
  this: BettererRun,
  result: BettererCoverageIssues,
  expected: BettererCoverageIssues
): Promise<BettererConstraintResult> {
  const { diff } = await differ.call(this, result, expected);
  if (isWorse(diff)) {
    return BettererConstraintResult.worse;
  }
  if (isBetter(diff)) {
    return BettererConstraintResult.better;
  }
  return BettererConstraintResult.same;
}

function isWorse(diff: BettererCoverageDiff): boolean {
  return Object.entries(diff).some(([, fileDiff]) => {
    const { lines, statements, functions, branches } = fileDiff;
    return lines < 0 || statements < 0 || functions < 0 || branches < 0;
  });
}

function isBetter(diff: BettererCoverageDiff): boolean {
  return Object.entries(diff).some(([, fileDiff]) => {
    const { lines, statements, functions, branches } = fileDiff;
    return lines > 0 || statements > 0 || functions > 0 || branches > 0;
  });
}
