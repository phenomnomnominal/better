import { Diagnostic, DiagnosticSeverity, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  BettererFileIssueSerialised,
  BettererFileIssuesSerialised,
  BettererFileTestDiff,
  BettererFileTestResultSerialised,
  BettererRunSummary,
  BettererSuite
} from '@betterer/betterer';

import { EXTENSION_NAME } from '../constants';
import { info } from './console';
import { getFilePath } from './path';

type BettererFileDiagnostics = Record<string, Array<Diagnostic>>;

export class BettererDiagnostics {
  private _diagnosticsMap: Record<string, BettererFileDiagnostics> = {};

  public getDiagnostics(document: TextDocument, runSummary: BettererRunSummary): Array<Diagnostic> {
    const filePath = getFilePath(document);
    if (filePath == null) {
      return [];
    }

    const currentFileDiagnostics = this._getAllDiagnosticsForFile(filePath);

    if (runSummary.isFailed) {
      return currentFileDiagnostics;
    }

    const result = runSummary.result?.value as BettererFileTestResultSerialised;
    if (!result) {
      return currentFileDiagnostics;
    }

    let issues: BettererFileIssuesSerialised;
    try {
      issues = this._getFileIssues(result, filePath);
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
      existingIssues = fileDiff.existing || [];
      newIssues = fileDiff.new || [];
    }

    info(`Validator: "${runSummary.name}" got "${existingIssues.length}" existing issues for "${filePath}"`);
    info(`Validator: "${runSummary.name}" got "${newIssues.length}" new issues for "${filePath}"`);

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
      const fileDiagnostics = this._diagnosticsMap[filePath] || {};
      const updatedDiagnostics: BettererFileDiagnostics = {};
      suite.runs.forEach((run) => {
        updatedDiagnostics[run.name] = fileDiagnostics[run.name] || [];
      });
      this._diagnosticsMap[filePath] = updatedDiagnostics;
    });
  }

  private _setTestDiagnosticsForFile(
    filePath: string,
    testName: string,
    diagnostics: Array<Diagnostic>
  ): Array<Diagnostic> {
    this._diagnosticsMap[filePath] = this._diagnosticsMap[filePath] || {};
    const fileDiagnostics = this._diagnosticsMap[filePath];
    fileDiagnostics[testName] = diagnostics;
    return this._getAllDiagnosticsForFile(filePath);
  }

  private _getAllDiagnosticsForFile(filePath: string): Array<Diagnostic> {
    const fileDiagnostics = this._diagnosticsMap[filePath] || {};
    return Object.keys(fileDiagnostics).flatMap((testName) => fileDiagnostics[testName]);
  }

  private _getFileIssues(result: BettererFileTestResultSerialised, filePath: string): BettererFileIssuesSerialised {
    const key = Object.keys(result).find((fileKey) => fileKey.startsWith(filePath));
    if (!key) {
      return [];
    }
    return result[key];
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
  const range = { start, end };
  const code = `[${name}]${extra ? ` - ${extra}` : ''}`;
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
