import type { BettererFilePaths, BettererFileResolver } from '../../fs/index.js';
import type { BettererFileTestResult, BettererFileIssues, BettererFile, BettererFileBase } from './types.js';

import assert from 'node:assert';
import path from 'node:path';

import { BettererFileΩ } from './file.js';

export class BettererFileTestResultΩ implements BettererFileTestResult {
  public isBettererFileTestResult = true;

  private _fileMap: Record<string, BettererFileBase> = {};
  private _files: Array<BettererFileBase> = [];
  private _filePaths: Array<string> = [];

  constructor(
    private _resolver: BettererFileResolver,
    private _resultsPath: string
  ) {}

  // Previously the `files` getter was just doing `Object.values(this._fileMap)`,
  // but that's pretty slow and this gets hit a lot, so instead the `this._files`
  // array is updated manually in `this._addFile()` and `this._replaceFile()`:
  public get files(): ReadonlyArray<BettererFileBase> {
    return this._files;
  }

  // Previously the `filePaths` getter was just doing `Object.keys(this._fileMap)`,
  // but that's pretty slow and this gets hit a lot, so instead the `this._filePaths`
  // array is updated manually in `this._addFile()` and `this._replaceFile()`:
  public get filePaths(): BettererFilePaths {
    return this._filePaths;
  }

  public getFile(absolutePath: string): BettererFileBase {
    const file = this._fileMap[absolutePath];
    assert(file);
    return file;
  }

  public addFile(filePath: string, fileText: string): BettererFile {
    const absolutePath = this._resolver.resolve(filePath);
    const relativePath = path.relative(path.dirname(this._resultsPath), absolutePath);
    const file = new BettererFileΩ(absolutePath, relativePath, fileText);
    const existingFile = this._fileMap[file.absolutePath];
    if (existingFile) {
      file.addIssues(existingFile.issues);
      this._replaceFile(file, existingFile);
      return file;
    }
    this._addFile(file);
    return file;
  }

  public addExpected(file: BettererFileBase): void {
    this._addFile(file);
  }

  public getIssues(absolutePath?: string): BettererFileIssues {
    if (!absolutePath) {
      return this.files.flatMap((files) => files.issues);
    }
    return this.getFile(absolutePath).issues;
  }

  private _addFile(file: BettererFileBase): void {
    if (!this._fileMap[file.absolutePath]) {
      this._files.push(file);
      this._filePaths.push(file.absolutePath);
    }
    this._fileMap[file.absolutePath] = file;
  }

  private _replaceFile(file: BettererFileBase, existingFile: BettererFileBase): void {
    this._files.splice(this._files.indexOf(existingFile), 1, file);
    this._filePaths.splice(this._filePaths.indexOf(existingFile.absolutePath), 1, file.absolutePath);
    this._fileMap[file.absolutePath] = file;
  }
}
