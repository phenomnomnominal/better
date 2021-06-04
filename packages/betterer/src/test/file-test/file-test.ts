import { BettererContext, BettererContextΩ, BettererRun, BettererRunΩ } from '../../context';
import { createTestConfig } from '../config';
import { BettererFileResolver, BettererFileResolverΩ, BettererFileGlobs, BettererFilePatterns } from '../../runner';
import { BettererTestType } from '../type';
import { BettererTestConstraint, BettererTestFunction, BettererTestGoal } from '../types';
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

  constructor(resolver: BettererFileResolver, fileTest: BettererFileTestFunction) {
    const { cwd } = resolver;
    this._resolver = new BettererFileResolverΩ(cwd);
    this._config = createTestConfig(
      {
        test: createTest(this._resolver, fileTest),
        constraint,
        goal,
        serialiser: { deserialise, serialise },
        differ,
        printer,
        progress
      },
      BettererTestType.File
    ) as BettererFileTestConfig;
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

  public exclude(...excludePatterns: BettererFilePatterns): this {
    this._resolver.exclude(...excludePatterns);
    return this;
  }

  public goal(goalOverride: BettererTestGoal<BettererFileTestResult>): this {
    this.config.goal = goalOverride;
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
  return async (run: BettererRun, context: BettererContext): Promise<BettererFileTestResult> => {
    const runΩ = run as BettererRunΩ;
    const contextΩ = context as BettererContextΩ;

    const specifiedFiles = runΩ.filePaths;
    const validatedFiles = await resolver.files(specifiedFiles);
    const changedFiles = await contextΩ.checkCache(validatedFiles);
    const cacheHit = validatedFiles.length !== changedFiles.length;
    const isPartial = specifiedFiles.length > 0 || cacheHit;

    const result = new BettererFileTestResultΩ(resolver);
    await fileTest(changedFiles, result);

    if (!isPartial || runΩ.isNew) {
      return result;
    }

    const expectedΩ = runΩ.expected.value as BettererFileTestResultΩ;

    // Get any filePaths that have expected issues but weren't included in this run:
    const excludedFilesWithIssues = expectedΩ.files
      .map((file) => file.absolutePath)
      .filter((filePath) => !changedFiles.includes(filePath));

    // Filter them based on the current resolver:
    const relevantExcludedFilePaths = await resolver.validate(excludedFilesWithIssues);

    // Add the existing issues to the new result:
    relevantExcludedFilePaths.forEach((filePath) => result.addExpected(expectedΩ.getFile(filePath)));

    return result;
  };
}
