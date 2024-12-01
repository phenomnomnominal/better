import type { BettererRun } from '../../run/index.js';
import type { BettererFileTestResult } from './types.js';

import { BettererConstraintResult } from '@betterer/constraints';

import { diff } from './differ.js';

export function constraint(
  this: BettererRun,
  result: BettererFileTestResult,
  expected: BettererFileTestResult
): BettererConstraintResult {
  const fileDiff = diff.call(this, expected, result);

  const filePaths = Object.entries(fileDiff.diff);

  if (filePaths.length === 0) {
    return BettererConstraintResult.same;
  }

  const hasNew = filePaths.filter(([, fileDiff]) => !!fileDiff.new?.length);

  if (hasNew.length) {
    return BettererConstraintResult.worse;
  }

  const hasFixed = filePaths.filter(([, fileDiff]) => !!fileDiff.fixed?.length);

  if (hasFixed.length) {
    return BettererConstraintResult.better;
  }

  return BettererConstraintResult.same;
}
