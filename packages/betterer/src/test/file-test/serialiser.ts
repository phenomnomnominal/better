import type {
  BettererFileBase,
  BettererFileIssues,
  BettererFileTestResult,
  BettererFileTestResultKey,
  BettererFileTestResultKeyParts,
  BettererFileTestResultSerialised
} from './types.js';

import { invariantΔ } from '@betterer/errors';
import path from 'node:path';

import { BettererFileResolverΩ } from '../../fs/index.js';
import { BettererFileTestResultΩ } from './file-test-result.js';

export function deserialise(serialised: BettererFileTestResultSerialised, resultsPath: string): BettererFileTestResult {
  const resolver = new BettererFileResolverΩ(path.dirname(resultsPath));
  const deserialised = new BettererFileTestResultΩ(resolver, resultsPath);
  Object.entries(serialised)
    .filter(([key]) => isKey(key))
    .map(([key, issuesForFile]) => {
      const { relativePath, hash } = splitKey(key as BettererFileTestResultKey);
      const issues = issuesForFile.map((issue) => {
        const [line, column, length, message, hash] = issue;
        return { line, column, length, message, hash };
      });
      const absolutePath = resolver.resolve(relativePath);
      const relativeKey: BettererFileTestResultKey = `${relativePath}:${hash}`;
      deserialised.addExpected({ absolutePath, key: relativeKey, hash, issues });
    });
  return deserialised as BettererFileTestResult;
}

export function serialise(result: BettererFileTestResult): BettererFileTestResultSerialised {
  const resultΩ = result as BettererFileTestResultΩ;
  return (
    resultΩ.files
      .filter((file) => file.issues.length)
      // Sort based on absolute file path, assuming that each file `resultΩ.files` has a unique path:
      .sort((fileA, fileB) => (fileA.absolutePath < fileB.absolutePath ? -1 : 1))
      .reduce<BettererFileTestResultSerialised>(
        (serialised: BettererFileTestResultSerialised, file: BettererFileBase) => {
          serialised[file.key] = sortLinesAndColumns(file.issues).map((issue) => [
            issue.line,
            issue.column,
            issue.length,
            issue.message,
            issue.hash
          ]);
          return serialised;
        },
        {}
      )
  );
}

function sortLinesAndColumns(issues: BettererFileIssues): BettererFileIssues {
  return [...issues].sort((a, b) => (a.line !== b.line ? a.line - b.line : a.column - b.column));
}

export function isKey(key: string): key is BettererFileTestResultKey {
  return /.*:.*/.test(key);
}

function splitKey(key: BettererFileTestResultKey): BettererFileTestResultKeyParts {
  const [relativePath, hash] = key.split(':');
  const parts = { relativePath, hash };
  assertKey(parts);
  return parts;
}

function assertKey(key: Partial<BettererFileTestResultKeyParts>): asserts key is BettererFileTestResultKeyParts {
  invariantΔ(key.relativePath != null && key.hash != null, 'Invalid serialised key parts, cannot deserialise!');
}
