import type { BettererFilePath } from './index.js';

import { BettererError } from '@betterer/errors';
import assert from 'node:assert';

import { read } from './index.js';
import { importText } from './import.js';
import { merge } from './merge.js';

const MERGE_CONFLICT_ANCESTOR = '|||||||';
const MERGE_CONFLICT_END = '>>>>>>>';
const MERGE_CONFLICT_SEP = '=======';
const MERGE_CONFLICT_START = '<<<<<<<';

const PARSE_CACHE = new Map<string, unknown>();

/**
 * Parses the contents of a given file path. If the file doesn't exist, it will
 * return an empty object. If the file exists, but has merge conflicts, it will merge the
 * files using {@link mergeResults | `mergeResults`}.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Throws if the results file cannot be parsed, or if it contains merge conflicts that
 * can't be resolved.
 */
export async function parse(filePath: BettererFilePath): Promise<unknown> {
  const contents = await read(filePath);
  if (!contents) {
    return {};
  }

  const cached = PARSE_CACHE.get(contents);
  if (cached) {
    return cached;
  }

  const parsed = parseContents(filePath, contents);
  PARSE_CACHE.set(contents, parsed);
  return parsed;
}

function parseContents(filePath: BettererFilePath, contents: string): unknown {
  if (hasMergeConflicts(contents)) {
    try {
      const [ours, theirs] = extractConflicts(contents);
      return merge(filePath, ours, theirs);
    } catch (error) {
      throw new BettererError(`could not resolve merge conflict in "${filePath}". 😔`, error as Error);
    }
  }

  try {
    return importText(filePath, contents);
  } catch (error) {
    throw new BettererError(`could not read results from "${filePath}". 😔`, error as Error);
  }
}

function hasMergeConflicts(str: string): boolean {
  return str.includes(MERGE_CONFLICT_START) && str.includes(MERGE_CONFLICT_SEP) && str.includes(MERGE_CONFLICT_END);
}

function extractConflicts(contents: string): [string, string] {
  const ours = [];
  const theirs = [];
  const lines = contents.split(/\r?\n/g);
  let skip = false;

  while (lines.length) {
    const line = lines.shift();
    assert(line != null);
    if (line.startsWith(MERGE_CONFLICT_START)) {
      // get our file
      while (lines.length) {
        const conflictLine = lines.shift();
        assert(conflictLine != null);
        if (conflictLine === MERGE_CONFLICT_SEP) {
          skip = false;
          break;
        } else if (skip || conflictLine.startsWith(MERGE_CONFLICT_ANCESTOR)) {
          skip = true;
          continue;
        } else {
          ours.push(conflictLine);
        }
      }

      // get their file
      while (lines.length) {
        const conflictLine = lines.shift();
        assert(conflictLine != null);
        if (conflictLine.startsWith(MERGE_CONFLICT_END)) {
          break;
        } else {
          theirs.push(conflictLine);
        }
      }
    } else {
      ours.push(line);
      theirs.push(line);
    }
  }
  return [ours.join('\n'), theirs.join('\n')];
}
