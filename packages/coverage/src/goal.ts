import type { BettererCoverageIssues } from './types.js';

export function goal(coverageIssues: BettererCoverageIssues): boolean {
  return Object.entries(coverageIssues).every(([, issues]) => {
    const { lines, statements, functions, branches } = issues;
    return lines === 0 && statements === 0 && functions === 0 && branches === 0;
  });
}
