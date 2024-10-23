import type { BettererContext, BettererContextSummary } from '../context/types.js';
import type { BettererFilePaths } from '../fs/index.js';

/**
 * @public The JS API for controlling **Betterer** runs.
 */
export interface BettererRunner extends BettererContext {
  /**
   * Queue a **Betterer** run.
   *
   * @param filePaths - List of files to test with **Betterer**. If `filePaths` is `undefined` then
   * all files will be tested.
   * @throws {@link @betterer/errors#BettererError | `BettererError` }
   * Will throw if something goes wrong while running **Betterer**.
   */
  queue(filePaths?: string | BettererFilePaths): Promise<void>;
  /**
   * Stop the runner, but first wait for it to finish running the current suite.
   *
   * @returns the {@link @betterer/betterer#BettererContextSummary | `BettererContextSummary`} containing
   * details of all successful runs.
   * @throws the error if something went wrong while stopping everything.
   */
  stop(): Promise<BettererContextSummary>;
  /**
   * Stop the runner, without waiting for it to finish running the suite.
   *
   * @param force - when `true`, the runner will stop immediately and any errors will be ignored.
   * @returns the {@link @betterer/betterer#BettererContextSummary | `BettererContextSummary`} containing
   * details of all successful runs, (or `null` if a run hasn't finished yet).
   */
  stop(force?: true): Promise<BettererContextSummary | null>;
}
