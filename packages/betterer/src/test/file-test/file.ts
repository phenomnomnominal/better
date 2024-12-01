import type { BettererFile, BettererFileIssue, BettererFileIssues, BettererFileTestResultKey } from './types.js';

import { invariantΔ } from '@betterer/errors';
import { LinesAndColumns } from 'lines-and-columns';
import path from 'node:path';

import { createHash } from '../../hasher.js';
import {
  isString,
  normalisedPath,
  normaliseNewlines,
  replaceAbsolutePaths,
  replaceRelativePaths
} from '../../utils.js';

const UNKNOWN_LOCATION = {
  line: 0,
  column: 0
} as const;

type BettererIssueStartEnd = [number, number, string, string?];
type BettererIssueLineColLength = [number, number, number, string, string?];
type BettererIssuePositions = [number, number, number, number, string, string?];
type BettererIssueOverride = BettererIssueStartEnd | BettererIssueLineColLength | BettererIssuePositions;

export class BettererFileΩ implements BettererFile {
  public readonly hash: string;
  public readonly key: BettererFileTestResultKey;

  private _issues: BettererFileIssues = [];

  constructor(
    public readonly absolutePath: string,
    private _relativePath: string,
    public readonly fileText: string
  ) {
    this.absolutePath = normalisedPath(absolutePath);
    this.hash = createHash(this.fileText);
    this.key = `${normalisedPath(this._relativePath)}:${this.hash}`;
  }

  public get issues(): BettererFileIssues {
    return this._issues;
  }

  public addIssues(issues: BettererFileIssues): void {
    this._issues = [...this._issues, ...issues];
  }

  public addIssue(...issueOverride: BettererIssueOverride): void {
    this.addIssues([this._handleIssue(issueOverride, this.fileText)]);
  }

  private _handleIssue(issueOverride: BettererIssueOverride, fileText: string): BettererFileIssue {
    const lc = new LinesAndColumns(fileText);

    let issue: BettererIssueLineColLength | null = null;
    if (isStartEnd(issueOverride)) {
      issue = getIssueFromStartEnd(lc, issueOverride);
    } else if (isLineColLength(issueOverride)) {
      issue = getIssueFromLineColLength(issueOverride);
    } else if (isPositions(issueOverride)) {
      issue = getIssueFromPositions(lc, issueOverride);
    }

    invariantΔ(issue, '`issue` must start with 2, 3, or 4 numbers designating the start and end position in a file!');

    const [line, column, length, rawMessage, overrideHash] = issue;

    let message = rawMessage;
    const dirname = path.dirname(this.absolutePath);
    message = replaceRelativePaths(message, dirname, path.posix);
    message = replaceRelativePaths(message, dirname, path.win32);
    message = replaceAbsolutePaths(message, dirname, path.posix);
    message = replaceAbsolutePaths(message, dirname, path.win32);

    const start = lc.indexForLocation({ line, column }) ?? 0;
    const issueText = fileText.substring(start, start + length);
    const normalisedText = normaliseNewlines(issueText);
    let hash = overrideHash;
    if (!hash) {
      hash = normalisedText ? createHash(normalisedText) : createHash(message);
    }
    return { line, column, length: normalisedText.length, message, hash };
  }
}

function getIssueFromLineColLength(issueOverride: BettererIssueLineColLength): BettererIssueLineColLength {
  return issueOverride;
}

function isLineColLength(issueOverride: BettererIssueOverride): issueOverride is BettererIssueLineColLength {
  const [, , , message] = issueOverride;
  return isString(message);
}

function getIssueFromStartEnd(lc: LinesAndColumns, issueOverride: BettererIssueStartEnd): BettererIssueLineColLength {
  const [start, end, message, overrideHash] = issueOverride;
  const { line, column } = lc.locationForIndex(start) ?? UNKNOWN_LOCATION;
  const length = end - start;
  return [line, column, length, message, overrideHash];
}

function isStartEnd(issueOverride: BettererIssueOverride): issueOverride is BettererIssueStartEnd {
  const [, , message] = issueOverride;
  return isString(message);
}

function getIssueFromPositions(lc: LinesAndColumns, issueOverride: BettererIssuePositions): BettererIssueLineColLength {
  const [line, column, endLine, endColumn, message, overrideHash] = issueOverride;
  const absStartColumn = Math.max(0, column);
  const absEndColumn = Math.max(0, endColumn);
  const start = lc.indexForLocation({ line, column: absStartColumn }) ?? 0;
  const end = lc.indexForLocation({ line: endLine, column: absEndColumn }) ?? 0;
  const length = end - start;
  return [line, absStartColumn, length, message, overrideHash];
}

function isPositions(issueOverride: BettererIssueOverride): issueOverride is BettererIssuePositions {
  const [, , , , message] = issueOverride;
  return isString(message);
}
