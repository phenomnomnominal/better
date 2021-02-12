import { BettererFileTestResultΩ } from './file-test-result';
import { BettererFileTestResult } from './types';

export function goal(result: BettererFileTestResult): boolean {
  const resultΩ = result as BettererFileTestResultΩ;
  return resultΩ.files.filter((file) => file.issues.length).length === 0;
}
