import type { BettererLogger } from '@betterer/logger';

import type { BettererRun } from '../../run/index.js';
import type { BettererFileTestResultΩ } from './file-test-result.js';
import type { BettererFileΩ } from './file.js';
import type {
  BettererFileBase,
  BettererFileIssue,
  BettererFileIssueSerialised,
  BettererFilesDiff,
  BettererFileTestDiff,
  BettererFileTestResult
} from './types.js';

import { invariantΔ } from '@betterer/errors';

const FORMATTER = Intl.NumberFormat();

export async function differ(this: BettererRun, expected: BettererFileTestResult, result: BettererFileTestResult) {
  return await differLog.call(this, expected, result);
}

export function diff(expected: BettererFileTestResult, result: BettererFileTestResult): BettererFileTestDiff {
  const diff: BettererFilesDiff = {};
  const expectedΩ = expected as BettererFileTestResultΩ;
  const resultΩ = result as BettererFileTestResultΩ;

  const unchangedResultFiles = resultΩ.files.filter((r) =>
    expectedΩ.files.find((e) => e.absolutePath === r.absolutePath && e.hash === r.hash)
  );

  const changedResultFiles = resultΩ.files.filter((r) =>
    expectedΩ.files.find((e) => e.absolutePath === r.absolutePath && e.hash !== r.hash)
  );

  const newOrMovedFiles = resultΩ.files.filter((r) => !expectedΩ.files.find((e) => e.absolutePath === r.absolutePath));

  const fixedOrMovedFiles = expectedΩ.files.filter(
    (e) => !resultΩ.files.find((r) => r.absolutePath === e.absolutePath)
  );

  const movedFiles = new Map<BettererFileBase, BettererFileBase>();
  fixedOrMovedFiles.forEach((fixedOrMovedFile, index) => {
    // A file may have been moved it has the same hash in both result and expected
    const possibilities = newOrMovedFiles.filter((newOrMovedFile) => newOrMovedFile.hash === fixedOrMovedFile.hash);
    if (!possibilities.length) {
      return;
    }

    // Multiple possibilities means that the same content has been moved into multiple new files.
    // So just count the first one as a move, the rest will be new files:
    const [moved] = possibilities;
    invariantΔ(moved, `\`possibilities.length\` should be at least \`1\`!`, possibilities.length);
    movedFiles.set(moved, fixedOrMovedFile);

    // Remove the moved file from the fixedOrMovedFiles array:
    fixedOrMovedFiles.splice(index, 1);
    // And from the newOrMovedFiles array:
    newOrMovedFiles.splice(newOrMovedFiles.indexOf(moved), 1);
  });

  // All the moved files have been removed from fixedOrMovedFiles and newOrMovedFiles:
  const fixedFiles = fixedOrMovedFiles;
  const newFiles = newOrMovedFiles;

  fixedFiles.forEach((file) => {
    diff[file.absolutePath] = {
      fixed: file.issues.map(serialiseIssue)
    };
  });

  newFiles.forEach((file) => {
    diff[file.absolutePath] = {
      new: file.issues.map(serialiseIssue)
    };
  });

  const existingFiles = [...unchangedResultFiles, ...changedResultFiles, ...Array.from(movedFiles.keys())];
  existingFiles.forEach((resultFile) => {
    const expectedFile = movedFiles.get(resultFile) ?? expectedΩ.getFile(resultFile.absolutePath);

    // Convert all issues to their deserialised form for easier diffing:
    const resultIssues = [...resultFile.issues];
    const expectedIssues = expectedFile.issues;

    // Find all issues that exist in both result and expected:
    const unchangedExpectedIssues = expectedIssues.filter((r) =>
      resultIssues.find((e) => {
        return e.line === r.line && e.column === r.column && e.length === r.length && e.hash === r.hash;
      })
    );
    const unchangedResultIssues = resultIssues.filter((r) =>
      expectedIssues.find((e) => {
        return e.line === r.line && e.column === r.column && e.length === r.length && e.hash === r.hash;
      })
    );

    // Any result issues that aren't in expected are either new or have been moved:
    const newOrMovedIssues = resultIssues.filter((r) => !unchangedResultIssues.includes(r));
    // Any expected issues that aren't in result are either fixed or have been moved:
    const fixedOrMovedIssues = expectedIssues.filter((e) => !unchangedExpectedIssues.includes(e));

    // We can find the moved issues by matching the issue hashes:
    const movedIssues: Array<BettererFileIssue> = [];
    const fixedIssues: Array<BettererFileIssue> = [];
    fixedOrMovedIssues.forEach((fixedOrMovedIssue) => {
      const { hash, line, column } = fixedOrMovedIssue;
      // An issue may have been moved it has the same hash in both result and expected
      const possibilities = newOrMovedIssues.filter((newOrMovedIssue) => newOrMovedIssue.hash === hash);
      if (!possibilities.length) {
        // If there is no matching has the issue must have been fixed:
        fixedIssues.push(fixedOrMovedIssue);
        return;
      }
      // Start by marking the first possibility as best:
      let best = possibilities.shift();
      invariantΔ(best, `\`best\` should be set!`, best);

      // And then search through all the possibilities to find the closest issue:
      possibilities.forEach((possibility) => {
        invariantΔ(best, `\`possibilities.length\` should be at least \`1\`!`, possibilities.length);
        if (Math.abs(line - possibility.line) >= Math.abs(line - best.line)) {
          return;
        }
        if (Math.abs(line - possibility.line) < Math.abs(line - best.line)) {
          best = possibility;
        }
        if (Math.abs(column - possibility.column) >= Math.abs(column - best.column)) {
          return;
        }
        if (Math.abs(column - possibility.column) < Math.abs(column - best.column)) {
          best = possibility;
        }
      });

      // Remove the moved issue from the newOrMovedIssues array:
      newOrMovedIssues.splice(newOrMovedIssues.indexOf(best), 1);

      movedIssues.push(best);
    });

    // Find the raw issue data so that diffs can be logged:
    const newIssues = newOrMovedIssues.map((newIssue) => {
      const issue = resultFile.issues[resultIssues.indexOf(newIssue)];
      // `newOrMovedIssues` comes from a filter on `resultIssues`,
      // which comes from `[...resultFile.issues]`, so this should always be valid.
      invariantΔ(issue, `\`issue\` should definitely exist within \`resultFile.issues\`!`, issue, resultFile.issues);
      return issue;
    });

    // If there's no change, move on:
    if (!newIssues.length && !fixedIssues.length) {
      return;
    }

    // Otherwise construct the diff:
    diff[resultFile.absolutePath] = {
      existing: [...unchangedExpectedIssues, ...movedIssues].map(serialiseIssue),
      fixed: fixedIssues.map(serialiseIssue),
      new: newIssues.map(serialiseIssue)
    };
  });

  return {
    diff
  };
}

async function differLog(this: BettererRun, expected: BettererFileTestResult, result: BettererFileTestResult) {
  const fileDiff = diff(expected, result);
  const resultΩ = result as BettererFileTestResultΩ;

  // Sort by file path:
  const diffEntries = Object.entries(fileDiff.diff).sort(([aPath], [bPath]) => (aPath < bPath ? -1 : 1));

  await Promise.all(
    diffEntries.map(async ([filePath, diff]) => {
      const existing = diff.existing ?? [];
      const fixed = diff.fixed ?? [];
      const newIssues = diff.new ?? [];
      const nExisting = existing.length;
      const nFixed = fixed.length;
      const nIssues = newIssues.length;

      let type: keyof BettererLogger = 'success';
      const messages: Array<string> = [];
      if (nFixed > 0) {
        messages.push(`${FORMATTER.format(nFixed)} fixed`);
      }
      if (nExisting > 0) {
        type = 'warn';
        messages.push(`${FORMATTER.format(nExisting)} existing`);
      }
      if (nIssues > 0) {
        type = 'error';
        messages.push(`${FORMATTER.format(nIssues)} new`);
      }
      await this.logger[type](`${messages.join(', ')} ${getIssues(nFixed + nExisting + nIssues)} in "${filePath}".`);

      if (nIssues) {
        if (nIssues > 1) {
          await this.logger.error(`Showing first of ${FORMATTER.format(nIssues)} new issues:`);
        }

        const [firstIssue] = newIssues;
        invariantΔ(firstIssue, `\`nIssues\` should be at least \`1\`!`, nIssues);
        const fileΩ = resultΩ.getFile(filePath) as BettererFileΩ;
        const { fileText } = fileΩ;
        const [line, column, length, message] = firstIssue;
        await this.logger.code({ message, filePath, fileText, line, column, length });
      }
    })
  );

  return fileDiff;
}

function getIssues(count: number): string {
  return count === 1 ? 'issue' : 'issues';
}

function serialiseIssue(issue: BettererFileIssue): BettererFileIssueSerialised {
  return [issue.line, issue.column, issue.length, issue.message, issue.hash];
}
