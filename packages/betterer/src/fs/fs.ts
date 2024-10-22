import type { BettererFilePath, BettererFilePaths, BettererFS } from './types.js';

import path from 'node:path';
import ignoreWalk from 'ignore-walk';

import { normalisedPath } from '../utils.js';

export class BettererFSΩ implements BettererFS {
  private _filePaths: BettererFilePaths = [];
  private _syncing: Promise<void> | null = null;

  private constructor(private _basePath: BettererFilePath) {}

  public static async create(fsPath: BettererFilePath): Promise<BettererFSΩ> {
    const fs = new BettererFSΩ(fsPath);
    await fs.sync();
    return fs;
  }

  public getFilePaths(): BettererFilePaths {
    return this._filePaths;
  }

  public async sync(): Promise<void> {
    if (this._syncing) {
      await this._syncing;
      return;
    }
    this._syncing = this._sync();
    await this._syncing;
    this._syncing = null;
  }

  private async _sync(): Promise<void> {
    // Collect all relevant files within the `basePath`:
    const filePaths = await new Promise<BettererFilePaths>((resolve, reject) => {
      const walker = new ignoreWalk.Walker({
        path: this._basePath,
        ignoreFiles: ['.gitignore', '']
      });
      // Force `walker` to ignore anything inside a `.git` folder:
      walker.onReadIgnoreFile('', '.git', () => void 0);
      walker.on('done', resolve).on('error', reject).start();
    });
    this._filePaths = filePaths.map((filePath) => toAbsolutePath(this._basePath, filePath));
  }
}

function toAbsolutePath(basePath: string, relativePath: string): string {
  return normalisedPath(path.join(basePath, relativePath.trimStart()));
}
