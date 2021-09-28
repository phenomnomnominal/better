import { diff, diffLinesUnified, diffStringsUnified, DiffOptions } from 'jest-diff';

/** @internal Definitely not stable! Please don't use! */
export function diffΔ<T>(a: T, b: T, diffOptions: DiffOptions): string | null {
  return diff(a, b, diffOptions);
}

/** @internal Definitely not stable! Please don't use! */
export function diffStringsΔ(a: string, b: string, diffOptions: DiffOptions): string {
  // jest-diff recommends using diffLinesUnified if str lengths are above 20,000 for performance
  if (a.length > 20_000 || b.length > 20_000) {
    return diffLinesUnified(a.split('\n'), b.split('\n'), diffOptions);
  }

  return diffStringsUnified(a, b, diffOptions);
}
