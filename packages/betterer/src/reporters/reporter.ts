import type { BettererError } from '@betterer/errors';
import type { BettererLoggerCodeInfo, BettererLoggerMessages } from '@betterer/logger';

import type { BettererContext } from '../context/index.js';
import type { BettererContextSummary } from '../context/types.js';
import type { BettererRun, BettererRunSummary } from '../run/index.js';
import type { BettererSuite, BettererSuiteSummary } from '../suite/index.js';
import type { BettererReporter, BettererRunLogger } from './types.js';

export class BettererReporterΩ implements BettererReporter {
  public runLogger: BettererRunLogger = {
    code: async (run: BettererRun, code: BettererLoggerCodeInfo): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.code(run, code)));
    },
    debug: async (run: BettererRun, ...debug: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.debug(run, ...debug)));
    },
    error: async (run: BettererRun, ...error: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.error(run, ...error)));
    },
    info: async (run: BettererRun, ...info: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.info(run, ...info)));
    },
    progress: async (run: BettererRun, ...progress: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.progress(run, ...progress)));
    },
    success: async (run: BettererRun, ...success: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.success(run, ...success)));
    },
    warn: async (run: BettererRun, ...warn: BettererLoggerMessages): Promise<void> => {
      await Promise.all(this._reporters.map((r) => r.runLogger?.warn(run, ...warn)));
    }
  };

  constructor(private _reporters: Array<BettererReporter>) {}

  async configError(invalidConfig: unknown, error: BettererError): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.configError?.(invalidConfig, error)));
  }

  async contextStart(context: BettererContext, lifecycle: Promise<BettererContextSummary>): Promise<void> {
    defaultLifecycleCatch(lifecycle);
    await Promise.all(this._reporters.map((r) => r.contextStart?.(context, lifecycle)));
  }

  async contextEnd(contextSummary: BettererContextSummary): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.contextEnd?.(contextSummary)));
  }

  async contextError(context: BettererContext, error: BettererError): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.contextError?.(context, error)));
  }

  async suiteStart(suite: BettererSuite, lifecycle: Promise<BettererSuiteSummary>): Promise<void> {
    defaultLifecycleCatch(lifecycle);
    await Promise.all(this._reporters.map((r) => r.suiteStart?.(suite, lifecycle)));
  }

  async suiteEnd(suiteSummary: BettererSuiteSummary): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.suiteEnd?.(suiteSummary)));
  }

  async suiteError(suite: BettererSuite, error: BettererError): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.suiteError?.(suite, error)));
  }

  async runStart(run: BettererRun, lifecycle: Promise<BettererRunSummary>): Promise<void> {
    defaultLifecycleCatch(lifecycle);
    await Promise.all(this._reporters.map((r) => r.runStart?.(run, lifecycle)));
  }

  async runEnd(run: BettererRunSummary): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.runEnd?.(run)));
  }

  async runError(run: BettererRun, error: BettererError): Promise<void> {
    await Promise.all(this._reporters.map((r) => r.runError?.(run, error)));
  }
}

function defaultLifecycleCatch(lifecycle: Promise<unknown>): void {
  // Just in case no-one handles this error in a reporter:
  lifecycle.catch(() => void 0);
}
