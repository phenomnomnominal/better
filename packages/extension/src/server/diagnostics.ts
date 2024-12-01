import type { Diagnostic, Position } from 'vscode-languageserver/node';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type {
  BettererFileIssueSerialised,
  BettererFileIssuesSerialised,
  BettererFileTestDiff,
  BettererFileTestResultSerialised,
  BettererRunSummary,
  BettererSuite,
  BettererConfig
} from '@betterer/betterer';

import path from 'node:path';
import { DiagnosticSeverity } from 'vscode-languageserver/node';

import { EXTENSION_NAME } from '../constants.js';
import { info } from './console.js';
import { getFilePath } from './path.js';

type BettererFileDiagnostics = Record<string, Array<Diagnostic> | null>;

export class BettererDiagnostics {
  private _diagnosticsMap: Record<string, BettererFileDiagnostics | null> = {};

  public getDiagnostics(
    config: BettererConfig,
    document: TextDocument,
    runSummary: BettererRunSummary
  ): Array<Diagnostic> {
    const filePath = getFilePath(document);
    if (filePath == null) {
      return [];
    }

    this._resetDiagnosticsForFile(filePath, runSummary.name);
    const currentFileDiagnostics = this._getAllDiagnosticsForFile(filePath);

    if (runSummary.isFailed) {
      return currentFileDiagnostics;
    }

    const result = runSummary.result?.value as BettererFileTestResultSerialised | null;
    if (!result) {
      return currentFileDiagnostics;
    }

    let issues: BettererFileIssuesSerialised;
    try {
      const issueFilePath = getIssuePath(config.resultsPath, filePath);
      issues = this._getFileIssues(result, issueFilePath);
    } catch (e) {
      info(JSON.stringify((e as Error).message));
      return currentFileDiagnostics;
    }

    if (issues.length === 0) {
      info(`Validator: No issues from Betterer for "${runSummary.name}"`);
      return currentFileDiagnostics;
    }

    info(`Validator: Got issues from Betterer for "${runSummary.name}"`);

    let existingIssues: BettererFileIssuesSerialised = [];
    let newIssues: BettererFileIssuesSerialised = [];

    if (runSummary.isNew) {
      newIssues = issues;
    } else if (runSummary.isSkipped || runSummary.isSame) {
      existingIssues = issues;
    } else {
      const fileDiff = (runSummary.diff as unknown as BettererFileTestDiff).diff[filePath];
      info(`Validator: "${runSummary.name}" got diff from Betterer for "${filePath}"`);
      existingIssues = fileDiff?.existing ?? [];
      newIssues = fileDiff?.new ?? [];
    }

    info(`Validator: "${runSummary.name}" got "${String(existingIssues.length)}" existing issues for "${filePath}"`);
    info(`Validator: "${runSummary.name}" got "${String(newIssues.length)}" new issues for "${filePath}"`);

    const diagnostics: Array<Diagnostic> = [];
    existingIssues.forEach((issue) => {
      diagnostics.push(createWarning(runSummary.name, 'existing issue', issue, document));
    });
    newIssues.forEach((issue) => {
      diagnostics.push(createError(runSummary.name, 'new issue', issue, document));
    });

    return this._setTestDiagnosticsForFile(filePath, runSummary.name, diagnostics);
  }

  public prepare(suite: BettererSuite): void {
    Object.keys(this._diagnosticsMap).forEach((filePath) => {
      const fileDiagnostics = this._diagnosticsMap[filePath] ?? {};
      const updatedDiagnostics: BettererFileDiagnostics = {};
      suite.runs.forEach((run) => {
        updatedDiagnostics[run.name] = fileDiagnostics[run.name] ?? [];
      });
      this._diagnosticsMap[filePath] = updatedDiagnostics;
    });
  }

  private _setTestDiagnosticsForFile(
    filePath: string,
    testName: string,
    diagnostics: Array<Diagnostic>
  ): Array<Diagnostic> {
    this._diagnosticsMap[filePath] = this._diagnosticsMap[filePath] ?? {};
    const fileDiagnostics = this._diagnosticsMap[filePath];
    fileDiagnostics[testName] = diagnostics;
    return this._getAllDiagnosticsForFile(filePath);
  }

  private _resetDiagnosticsForFile(filePath: string, testName: string): void {
    const fileDiagnostics = this._diagnosticsMap[filePath] ?? {};
    fileDiagnostics[testName] = [];
    this._diagnosticsMap[filePath] = fileDiagnostics;
  }

  private _getAllDiagnosticsForFile(filePath: string): Array<Diagnostic> {
    const fileDiagnostics = this._diagnosticsMap[filePath] ?? {};
    return Object.keys(fileDiagnostics).flatMap((testName) => fileDiagnostics[testName] ?? []);
  }

  private _getFileIssues(result: BettererFileTestResultSerialised, filePath: string): BettererFileIssuesSerialised {
    const entry = Object.entries(result).find(([fileKey]) => fileKey.startsWith(filePath));
    if (!entry) {
      return [];
    }
    const [, issues] = entry;
    return issues;
  }
}

function createDiagnostic(
  name: string,
  issue: BettererFileIssueSerialised,
  extra: string,
  document: TextDocument,
  severity: DiagnosticSeverity
): Diagnostic {
  const [line, column, length, message] = issue;
  let start: Position | null = null;
  let end: Position | null = null;
  start = { line, character: column };
  end = document.positionAt(document.offsetAt(start) + length);

  // The length of an issues stored in the results file is based on LF line endings,
  // so if the issue contains CRLF endings, increment the length by 1 for each new line:
  let text = document.getText({ start, end });
  while (text.replace(/\r\n/g, '\n').length < length) {
    const crlfs = text.match(/\r\n/g) ?? [];
    end = document.positionAt(document.offsetAt(start) + length + crlfs.length);
    text = document.getText({ start, end });
  }
  const range = { start, end };

  const code = `[${name}] - ${extra}`;
  return {
    message,
    severity,
    source: EXTENSION_NAME,
    range,
    code
  };
}

function createError(
  name: string,
  extra: string,
  issue: BettererFileIssueSerialised,
  document: TextDocument
): Diagnostic {
  return createDiagnostic(name, issue, extra, document, DiagnosticSeverity.Error);
}

function createWarning(
  name: string,
  extra: string,
  issue: BettererFileIssueSerialised,
  document: TextDocument
): Diagnostic {
  return createDiagnostic(name, issue, extra, document, DiagnosticSeverity.Warning);
}

function getIssuePath(resultsPath: string, filePath: string): string {
  const directory = `${normalisedPath(path.dirname(resultsPath))}/`;
  return path.relative(directory, filePath);
}

function normalisedPath(filePath: string): string {
  return path.sep === path.posix.sep ? filePath : filePath.split(path.sep).join(path.posix.sep);
}
