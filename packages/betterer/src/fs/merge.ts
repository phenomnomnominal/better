import { importText } from './import.js';

/**
 * Takes two strings of JavaScript, evaluates their contents, and merges the results,
 * with the latter taking precedence.
 */
export function merge(filePath: string, ours: string, theirs: string): unknown {
  return { ...(importText(filePath, ours) as object), ...(importText(filePath, theirs) as object) };
}
