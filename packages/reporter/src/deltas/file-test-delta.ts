import type { BettererDelta } from '@betterer/betterer';

const formatter = Intl.NumberFormat();

export function fileTestDelta(delta: BettererDelta | null): string {
  if (!delta) {
    return '';
  }
  const { baseline, diff, result } = delta;
  const resultFormatted = formatter.format(result);
  if (baseline == null || diff === 0) {
    return ` (${resultFormatted} ${getIssuesStr(result)})`;
  }

  const diffIssues = getIssuesStr(diff);
  if (diff < 0) {
    const diffFormatted = formatter.format(-diff);
    return ` (${diffFormatted} fixed ${diffIssues}, ${resultFormatted} remaining)`;
  }

  const diffFormatted = formatter.format(diff);
  const existingFormatted = formatter.format(result - diff);
  return ` (${diffFormatted} new ${diffIssues}, ${existingFormatted} existing, ${resultFormatted} total)`;
}

function getIssuesStr(n: number): string {
  return Math.abs(n) === 1 ? 'issue' : 'issues';
}
