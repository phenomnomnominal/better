import { BettererFilePaths, BettererVersionControlWorker } from '../fs';
import { BettererResult, BettererResultΩ } from '../results';
import { BettererTestMeta } from '../test';
import { BettererRunWorkerHandleΩ, BettererRunWorkerPoolΩ } from './run-worker-pool';
import { BettererRun, BettererRunSummary, BettererWorkerRunConfig } from './types';

export class BettererRunΩ implements BettererRun {
  public readonly isNew: boolean;
  public readonly isSkipped: boolean;

  private constructor(
    public name: string,
    private _workerHandle: BettererRunWorkerHandleΩ,
    public testMeta: BettererTestMeta,
    public baseline: BettererResult | null,
    public expected: BettererResult | null,
    public filePaths: BettererFilePaths | null
  ) {
    this.isNew = testMeta.isNew;
    this.isSkipped = testMeta.isSkipped;
  }

  public static async create(
    runWorkerPool: BettererRunWorkerPoolΩ,
    testName: string,
    config: BettererWorkerRunConfig,
    filePaths: BettererFilePaths,
    versionControl: BettererVersionControlWorker
  ): Promise<BettererRunΩ> {
    const workerHandle = runWorkerPool.getWorkerHandle();
    await workerHandle.free;
    workerHandle.claim();
    const testMeta = await workerHandle.worker.init(testName, config, versionControl);
    workerHandle.release();

    const baseline = !testMeta.isNew ? new BettererResultΩ(JSON.parse(testMeta.baselineJSON)) : null;
    const expected = !testMeta.isNew ? new BettererResultΩ(JSON.parse(testMeta.expectedJSON)) : null;

    return new BettererRunΩ(
      testName,
      workerHandle,
      testMeta,
      baseline,
      expected,
      testMeta.isFileTest ? filePaths : null
    );
  }

  public async run(isSkipped: boolean): Promise<BettererRunSummary> {
    await this._workerHandle.free;
    this._workerHandle.claim();
    const timestamp = Date.now();
    const summary = await this._workerHandle.worker.run(this.name, this.filePaths, isSkipped, timestamp);
    this._workerHandle.release();
    return summary;
  }
}

export type BettererRunsΩ = ReadonlyArray<BettererRunΩ>;
