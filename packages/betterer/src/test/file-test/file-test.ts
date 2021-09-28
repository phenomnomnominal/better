import assert from 'assert';
import path from 'path';

import { BettererFileResolverΩ, BettererFileGlobs, BettererFilePatterns } from '../../fs';
import { BettererRun, BettererWorkerRunΩ } from '../../run';
import { createDeadline, createGoal, createTestConfig } from '../config';
import { BettererTestConstraint, BettererTestDeadline, BettererTestFunction, BettererTestGoal } from '../types';
import { constraint } from './constraint';
import { differ } from './differ';
import { BettererFileTestResultΩ } from './file-test-result';
import { goal } from './goal';
import { printer } from './printer';
import { progress } from './progress';
import { deserialise, serialise } from './serialiser';
import {
  BettererFileTestBase,
  BettererFileTestConfig,
  BettererFileTestFunction,
  BettererFileTestResult
} from './types';

export class BettererFileTest implements BettererFileTestBase {
  private _config: BettererFileTestConfig;
  private _isOnly = false;
  private _isSkipped = false;
  private _resolver: BettererFileResolverΩ;

  constructor(fileTest: BettererFileTestFunction) {
    this._resolver = new BettererFileResolverΩ();
    this._config = createTestConfig({
      test: createTest(this._resolver, fileTest),
      constraint,
      goal,
      serialiser: { deserialise, serialise },
      differ,
      printer,
      progress
    }) as BettererFileTestConfig;
  }

  public get config(): BettererFileTestConfig {
    return this._config;
  }

  public get isOnly(): boolean {
    return this._isOnly;
  }

  public get isSkipped(): boolean {
    return this._isSkipped;
  }

  public constraint(constraintOverride: BettererTestConstraint<BettererFileTestResult>): this {
    this.config.constraint = constraintOverride;
    return this;
  }

  public deadline(deadlineOverride: BettererTestDeadline): this {
    this.config.deadline = createDeadline({ ...this.config, deadline: deadlineOverride });
    return this;
  }

  public exclude(...excludePatterns: BettererFilePatterns): this {
    this._resolver.exclude(...excludePatterns);
    return this;
  }

  public goal(goalOverride: BettererTestGoal<BettererFileTestResult>): this {
    this.config.goal = createGoal({ ...this.config, goal: goalOverride });
    return this;
  }

  public include(...includePatterns: BettererFileGlobs): this {
    this._resolver.include(...includePatterns);
    return this;
  }

  public only(): this {
    this._isOnly = true;
    return this;
  }

  public skip(): this {
    this._isSkipped = true;
    return this;
  }
}

function createTest(
  resolver: BettererFileResolverΩ,
  fileTest: BettererFileTestFunction
): BettererTestFunction<BettererFileTestResult> {
  return async (run: BettererRun): Promise<BettererFileTestResult> => {
    const runΩ = run as BettererWorkerRunΩ;
    assert(runΩ.filePaths);

    const baseDirectory = path.dirname(runΩ.test.configPath);

    const { config, versionControl } = runΩ.globals;
    resolver.init(baseDirectory, versionControl, config);

    const hasSpecifiedFiles = runΩ.filePaths.length > 0;
    runΩ.filePaths = hasSpecifiedFiles ? await resolver.validate(runΩ.filePaths) : await resolver.files();

    const runFiles = runΩ.isNew ? runΩ.filePaths : await versionControl.filterCached(run.name, runΩ.filePaths);

    const cacheHit = runΩ.filePaths.length !== runFiles.length;
    const isPartial = hasSpecifiedFiles || cacheHit;

    const result = new BettererFileTestResultΩ(resolver);
    await fileTest(runFiles, result, resolver);

    if (!isPartial || runΩ.isNew) {
      return result;
    }

    // Get any filePaths that have expected issues but weren't included in this run:
    const expectedΩ = runΩ.expected.value as BettererFileTestResultΩ;
    const excludedFilesWithIssues = expectedΩ.files
      .map((file) => file.absolutePath)
      .filter((filePath) => !runFiles.includes(filePath));

    // Filter them based on the current resolver:
    const relevantExcludedFilePaths = await resolver.validate(excludedFilesWithIssues);

    // Add the existing issues to the new result:
    relevantExcludedFilePaths.forEach((filePath) => result.addExpected(expectedΩ.getFile(filePath)));

    return result;
  };
}

export function isBettererFileTest(test: unknown): test is BettererFileTest {
  return !!test && (test as BettererFileTest).constructor.name === BettererFileTest.name;
}
