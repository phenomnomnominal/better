import type { SimpleGit } from 'simple-git';

import type { BettererFilePath, BettererVersionControl } from './types.js';

import { simpleGit } from 'simple-git';

export class BettererGitΩ implements BettererVersionControl {
  private _git: SimpleGit;

  public constructor(versionControlPath: BettererFilePath) {
    this._git = simpleGit(versionControlPath);
  }

  public async add(resultsPath: string): Promise<void> {
    await this._git.add(resultsPath);
  }
}
