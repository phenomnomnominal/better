import type { BettererFilePath } from '../fs/index.js';
import type { BettererOptionsMerge, BettererResultsSerialised } from './types.js';

import { merge, parse, write } from '../fs/index.js';
import { createMergeConfig } from './config.js';
import { printResults } from './print.js';

export class BettererResultsMergerΩ {
  private constructor(
    private _contents: Array<string>,
    private _resultsPath: BettererFilePath
  ) {}

  public static async create(options: BettererOptionsMerge): Promise<BettererResultsMergerΩ> {
    const { contents, resultsPath } = await createMergeConfig(options);
    return new BettererResultsMergerΩ(contents, resultsPath);
  }

  public async merge(): Promise<void> {
    const [ours, theirs] = this._contents;
    let merged: BettererResultsSerialised;
    if (ours != null && theirs != null) {
      merged = merge(this._resultsPath, ours, theirs) as BettererResultsSerialised;
    } else {
      merged = (await parse(this._resultsPath)) as BettererResultsSerialised;
    }
    await write(printResults(merged), this._resultsPath);
  }
}
