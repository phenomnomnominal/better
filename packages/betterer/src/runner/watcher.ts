import { FSWatcher, watch } from 'chokidar';
import minimatch from 'minimatch';
import * as path from 'path';

import { BettererOptionsOverride, BettererOptionsWatch } from '../config';
import { BettererFilePaths } from '../fs';
import { BettererSuiteSummary } from '../suite';
import { normalisedPath } from '../utils';
import { BettererRunnerΩ } from './runner';
import { BettererRunner } from './types';

const EMIT_EVENTS = ['add', 'change'];

export class BettererWatcherΩ implements BettererRunner {
  private constructor(private _runner: BettererRunnerΩ, private _watcher: FSWatcher) {}

  public static async create(options: BettererOptionsWatch): Promise<BettererWatcherΩ> {
    const runner = await BettererRunnerΩ.create({ ...options, watch: true });

    const { cwd, resultsPath } = runner.config;

    const watcher = watch(cwd, {
      ignoreInitial: true,
      ignored: (itemPath: string) => {
        // read `ignores` here so that it can be updated by watch mode:
        const { ignores } = runner.config;
        const watchIgnores = [...ignores].map((ignore) => path.join(cwd, ignore));
        return (
          itemPath !== normalisedPath(cwd) &&
          (itemPath === normalisedPath(resultsPath) ||
            watchIgnores.some((ignore) => minimatch(itemPath, ignore, { matchBase: true })))
        );
      }
    });

    watcher.on('all', (event: string, filePath: string) => {
      if (EMIT_EVENTS.includes(event)) {
        void runner.queue([filePath]);
      }
    });

    await new Promise((resolve, reject) => {
      watcher.on('ready', resolve);
      watcher.on('error', reject);
    });
    return new BettererWatcherΩ(runner, watcher);
  }

  public options(configOverride: BettererOptionsOverride): void {
    this._runner.options(configOverride);
  }

  public queue(filePaths: string | BettererFilePaths): Promise<void> {
    return this._runner.queue(filePaths);
  }

  public async stop(force: true): Promise<null>;
  public async stop(): Promise<BettererSuiteSummary>;
  public async stop(force?: true): Promise<BettererSuiteSummary | null> {
    await this._watcher.close();
    return await (force ? this._runner.stop(force) : this._runner.stop());
  }
}
