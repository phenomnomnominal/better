import { BettererError } from '@betterer/errors';

import type { BettererConfig, BettererOptionsOverride } from '../config/index.js';
import type { BettererFilePaths } from '../fs/index.js';
import type { BettererReporterΩ } from '../reporters/index.js';
import type {
  BettererSuite,
  BettererSuites,
  BettererSuiteSummaries,
  BettererSuiteSummary,
  BettererSuiteSummaryΩ
} from '../suite/index.js';
import type { BettererContext, BettererContextSummary } from './types.js';

import { overrideContextConfig } from '../context/index.js';
import type { BettererFileResolverΩ } from '../fs/index.js';
import { overrideReporterConfig } from '../reporters/index.js';
import { overrideWatchConfig } from '../runner/index.js';
import { BettererSuiteΩ } from '../suite/index.js';
import { getGlobals } from '../globals.js';
import { BettererContextSummaryΩ } from './context-summary.js';

export class BettererContextΩ implements BettererContext {
  public readonly config: BettererConfig;

  private _suites: BettererSuites = [];
  private _suiteSummaries: BettererSuiteSummaries = [];

  constructor() {
    const { config } = getGlobals();
    this.config = config;
  }

  public get lastSuite(): BettererSuite {
    const suite = this._suites[this._suites.length - 1];
    if (!suite) {
      throw new BettererError(`Context has not started a suite run yet! ❌`);
    }
    return suite;
  }

  public async options(optionsOverride: BettererOptionsOverride): Promise<void> {
    // Wait for any pending run to finish, and any existing reporter to render:
    let lastSuiteΩ: BettererSuiteΩ | null = null;
    try {
      const lastSuite = this.lastSuite;
      lastSuiteΩ = lastSuite as BettererSuiteΩ;
      await lastSuiteΩ.lifecycle.promise;
    } catch {
      // It's okay if there's not a pending suite!
    }

    // Override the config:
    overrideContextConfig(optionsOverride);
    await overrideReporterConfig(optionsOverride);
    overrideWatchConfig(optionsOverride);

    if (lastSuiteΩ) {
      // Run the tests again, with all the new options:
      void this.run(lastSuiteΩ.filePaths, false);
    }
  }

  public async run(specifiedFilePaths: BettererFilePaths, isRunOnce = false): Promise<BettererSuiteSummary> {
    const { config, reporter, resolvers, results } = getGlobals();
    const resolver = resolvers.cwd as BettererFileResolverΩ;

    const { includes, excludes } = config;
    resolver.include(...includes);
    resolver.exclude(...excludes);

    const hasSpecifiedFiles = specifiedFilePaths.length > 0;
    const hasGlobalIncludesExcludes = includes.length || excludes.length;

    let filePaths: BettererFilePaths;
    if (hasSpecifiedFiles && hasGlobalIncludesExcludes) {
      // Validate specified files based on global `includes`/`excludes and gitignore rules:
      filePaths = await resolver.validate(specifiedFilePaths);
    } else if (hasSpecifiedFiles) {
      // Validate specified files based on gitignore rules:
      filePaths = await resolver.validate(specifiedFilePaths);
    } else if (hasGlobalIncludesExcludes) {
      // Resolve files based on global `includes`/`excludes and gitignore rules:
      filePaths = await resolver.files();
    } else {
      // When `filePaths` is `[]` the test will use its specific resolver:
      filePaths = [];
    }

    const suiteΩ = await BettererSuiteΩ.create(filePaths);
    this._suites.push(suiteΩ);

    const reporterΩ = reporter as BettererReporterΩ;

    // Don't await here! A custom reporter could be awaiting
    // the lifecycle promise which is unresolved right now!
    const reportSuiteStart = reporterΩ.suiteStart(suiteΩ, suiteΩ.lifecycle.promise);
    try {
      const suiteSummary = await suiteΩ.run();
      this._suiteSummaries = [...this._suiteSummaries, suiteSummary];

      if (!isRunOnce && !config.ci) {
        const suiteSummaryΩ = suiteSummary as BettererSuiteSummaryΩ;
        await results.api.write(suiteSummaryΩ.result);
      }

      // Lifecycle promise is resolved, so it's safe to await
      // the result of `reporter.suiteStart`:
      suiteΩ.lifecycle.resolve(suiteSummary);
      await reportSuiteStart;

      await reporterΩ.suiteEnd(suiteSummary);
      return suiteSummary;
    } catch (error) {
      // Lifecycle promise is rejected, so it's safe to await
      // the result of `reporter.suiteStart`:
      suiteΩ.lifecycle.reject(error as BettererError);
      await reportSuiteStart;

      await reporterΩ.suiteError(suiteΩ, error as BettererError);
      throw error;
    }
  }

  public async stop(): Promise<BettererContextSummary> {
    try {
      const lastSuiteΩ = this.lastSuite as BettererSuiteΩ;
      await lastSuiteΩ.lifecycle.promise;
    } catch {
      // Not a problem if there hasn't been a suite run yet!
    }

    return new BettererContextSummaryΩ(this._suiteSummaries);
  }
}
