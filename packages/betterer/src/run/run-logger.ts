import type { BettererLogger, BettererLoggerCodeInfo, BettererLoggerMessage } from '@betterer/logger';

import type { BettererRunLogger } from '../reporters/types.js';
import type { BettererRun } from './types.js';

export class BettererRunLoggerΩ implements BettererLogger {
  constructor(
    private _runLogger: BettererRunLogger,
    private readonly _run: BettererRun
  ) {}

  public async code(codeInfo: BettererLoggerCodeInfo): Promise<void> {
    await this._runLogger.code(this._run, codeInfo);
  }

  public async debug(debug: BettererLoggerMessage): Promise<void> {
    await this._runLogger.debug(this._run, debug);
  }

  public async error(error: BettererLoggerMessage): Promise<void> {
    await this._runLogger.error(this._run, error);
  }

  public async info(info: BettererLoggerMessage): Promise<void> {
    await this._runLogger.info(this._run, info);
  }

  public async progress(progress: BettererLoggerMessage): Promise<void> {
    await this._runLogger.progress(this._run, progress);
  }

  public async success(success: BettererLoggerMessage): Promise<void> {
    await this._runLogger.success(this._run, success);
  }

  public async warn(warn: BettererLoggerMessage): Promise<void> {
    await this._runLogger.warn(this._run, warn);
  }
}
