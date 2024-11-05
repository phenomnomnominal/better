import { exposeToWorkerΔ } from '@betterer/worker';
import type { BettererError } from '@betterer/errors';
import type { BettererLogger } from '@betterer/logger';

import type { BettererFilePaths } from '../fs/index.js';
import type { BettererReporter, BettererReporterΩ } from '../reporters/index.js';
import type { BettererTestMeta } from '../test/index.js';
import type { BettererRunMeta } from './meta/types.js';
import type { BettererRun, BettererRunSummary, BettererRunWorkerHandle } from './types.js';

import { getTimeΔ } from '@betterer/time';

import { getGlobals } from '../globals.js';
import { BettererResultΩ } from '../results/index.js';
import { BettererRunLoggerΩ } from './run-logger.js';
import { BettererRunSummaryΩ } from './run-summary.js';

export class BettererRunΩ implements BettererRun {
  public readonly lifecycle = Promise.withResolvers<BettererRunSummary>();
  public readonly isNew: boolean;
  public readonly isObsolete: boolean = false;
  public readonly isOnly: boolean;
  public readonly isRemoved: boolean = false;
  public readonly isSkipped: boolean;
  public readonly name: string;
  public readonly logger: BettererLogger;

  private constructor(
    private _workerHandle: BettererRunWorkerHandle,
    reporter: BettererReporter,
    public testMeta: BettererTestMeta,
    public runMeta: BettererRunMeta,
    public baseline: BettererResultΩ | null,
    public expected: BettererResultΩ | null,
    public filePaths: BettererFilePaths | null
  ) {
    const { runLogger } = reporter as BettererReporterΩ;
    this.logger = exposeToWorkerΔ(new BettererRunLoggerΩ(runLogger, this));

    this.isNew = !(baseline && expected);
    this.isOnly = runMeta.isOnly;
    this.isSkipped = runMeta.isSkipped;
    this.name = testMeta.name;

    // Always run all files for a new test, even if just passed a single file:
    if (this.isNew && this.filePaths) {
      this.filePaths = [];
    }
  }

  public static async create(testMeta: BettererTestMeta, filePaths: BettererFilePaths): Promise<BettererRunΩ> {
    const { config, fs, reporter, results, runWorkerPool } = getGlobals();

    const workerHandle = runWorkerPool.getWorkerHandle();
    const worker = await workerHandle.claim();

    const runMeta = await worker.api.init(testMeta, { ...config, workers: 1 }, fs, results);
    workerHandle.release();

    let baseline: BettererResultΩ | null = null;
    let expected: BettererResultΩ | null = null;

    const isNew = !(await results.api.hasBaseline(testMeta.name));
    if (!isNew) {
      const baselineSerialised = await results.api.getBaseline(testMeta.name);
      const expectedSerialised = await results.api.getExpected(testMeta.name);
      baseline = new BettererResultΩ(JSON.parse(baselineSerialised), baselineSerialised);
      expected = new BettererResultΩ(JSON.parse(expectedSerialised), expectedSerialised);
    }

    return new BettererRunΩ(
      workerHandle,
      reporter,
      testMeta,
      runMeta,
      baseline,
      expected,
      runMeta.hasFilePaths ? filePaths : null
    );
  }

  public async run(isFiltered: boolean): Promise<BettererRunSummary> {
    const worker = await this._workerHandle.claim();
    const timestamp = getTimeΔ();
    try {
      return await worker.api.run(this.logger, this.name, this.filePaths, isFiltered, timestamp);
    } catch (error) {
      return new BettererRunSummaryΩ({
        baseline: this.baseline,
        delta: null,
        diff: null,
        error: error as BettererError,
        expected: this.expected,
        filePaths: this.filePaths,
        isBetter: false,
        isComplete: false,
        isExpired: false,
        isFailed: true,
        isNew: this.isNew,
        isObsolete: this.isObsolete,
        isRemoved: this.isRemoved,
        isSame: false,
        isSkipped: false,
        isUpdated: false,
        isWorse: false,
        logger: this.logger,
        name: this.name,
        result: null,
        timestamp: timestamp
      });
    } finally {
      this._workerHandle.release();
    }
  }
}
