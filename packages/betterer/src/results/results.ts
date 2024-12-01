import type { BettererFilePath } from '../fs/index.js';
import type { BettererTestNames } from '../test/index.js';
import type { BettererResultsSerialised } from './types.js';

import assert from 'node:assert';

import { BettererResultsFileΩ } from '../fs/index.js';
import { write } from '../fs/index.js';
import { printResults } from './print.js';

export class BettererResultsΩ {
  private _expected: BettererResultsSerialised;

  private constructor(
    private _resultsPath: BettererFilePath,
    private _baseline: BettererResultsSerialised
  ) {
    this._expected = this._baseline;
  }

  public static async create(resultsPath: BettererFilePath) {
    const resultsFile = new BettererResultsFileΩ(resultsPath);
    return new BettererResultsΩ(resultsPath, await resultsFile.parse());
  }

  public getBaseline(testName: string): string {
    return this._getResult(testName, this._baseline);
  }

  public getExpected(testName: string): string {
    return this._getResult(testName, this._expected);
  }

  public getExpectedTestNames(): BettererTestNames {
    return Object.keys(this._expected);
  }

  public hasBaseline(testName: string): boolean {
    return Object.hasOwnProperty.call(this._baseline, testName);
  }

  public async write(result: BettererResultsSerialised): Promise<string | null> {
    const printedExpected = printResults(this._expected);
    const printedResult = printResults(result);

    const shouldWrite = printedResult !== printedExpected;
    if (shouldWrite) {
      await write(printedResult, this._resultsPath);
      this._expected = result;
      return printedResult;
    }
    return null;
  }

  private _getResult(name: string, results: BettererResultsSerialised): string {
    const result = results[name];
    assert(result);
    return result.value;
  }
}
