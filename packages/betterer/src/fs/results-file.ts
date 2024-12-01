import type { BettererResultsSerialised } from '../results/index.js';

import { parse } from './parse.js';

export class BettererResultsFileΩ {
  constructor(private readonly _resultsPath: string) {}

  public async parse(): Promise<BettererResultsSerialised> {
    return (await parse(this._resultsPath)) as BettererResultsSerialised;
  }
}
