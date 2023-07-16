import type { BettererResultsSerialised } from './types';

import { BettererError } from '@betterer/errors';
import assert from 'assert';

import { read } from '../fs';
import { mergeResults } from './merge';
import { requireText } from './require';

const MERGE_CONFLICT_ANCESTOR = '|||||||';
const MERGE_CONFLICT_END = '>>>>>>>';
const MERGE_CONFLICT_SEP = '=======';
const MERGE_CONFLICT_START = '<<<<<<<';

/**
 * Parses the contents of a given results file path. If the file doesn't exist, it will
 * return an empty object. If the file exists, but has merge conflicts, it will merge the
 * files using {@link mergeResults | `mergeResults`}.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Throws if the results file cannot be parsed, or if it contains merge conflicts that
 * can't be resolved.
 */
export async function parseResults(resultsPath: string): Promise<BettererResultsSerialised> {
  const contents = await read(resultsPath);
  if (!contents) {
    return {};
  }

  if (hasMergeConflicts(contents)) {
    try {
      const [ours, theirs] = extractConflicts(contents);
      return mergeResults(ours, theirs);
    } catch (error) {
      throw new BettererError(`could not resolve merge conflict in "${resultsPath}". 😔`, error as Error);
    }
  }

  try {
    return await requireText(contents);
  } catch {
    throw new BettererError(`could not read results from "${resultsPath}". 😔`);
  }
}

function hasMergeConflicts(str: string): boolean {
  return str.includes(MERGE_CONFLICT_START) && str.includes(MERGE_CONFLICT_SEP) && str.includes(MERGE_CONFLICT_END);
}

function extractConflicts(file: string): [string, string] {
  const ours = [];
  const theirs = [];
  const lines = file.split(/\r?\n/g);
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
