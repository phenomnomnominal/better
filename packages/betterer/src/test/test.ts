import type {
  BettererTestConfig,
  BettererTestConstraint,
  BettererTestDeadline,
  BettererTestGoal,
  BettererTestOptions
} from './types.js';

import { BettererTestConfigΩ, createDeadline, createGoal } from './config.js';
import { checkBaseName } from './utils.js';

/**
 * @public The main interface to the **Betterer** {@link https://phenomnomnominal.github.io/betterer/docs/tests | test system}.
 *
 * @example
 * ```typescript
 * import { BettererTest } from '@betterer/betterer';
 * import { smaller } from '@betterer/constraints';
 * import glob from 'glob';
 *
 * const test = new BettererTest({
 *   test: () => glob.sync('**\/*').length,
 *   constraint: smaller
 * });
 * ```
 *
 * @param options - The options that define the test.
 */
export class BettererTest<DeserialisedType = unknown, SerialisedType = DeserialisedType, DiffType = null> {
  private _config: BettererTestConfigΩ<DeserialisedType, SerialisedType, DiffType>;
  private _isOnly = false;
  private _isSkipped = false;

  constructor(options: BettererTestOptions<DeserialisedType, SerialisedType, DiffType>) {
    this._config = new BettererTestConfigΩ(options);
  }

  /**
   * The complete configuration for the test.
   */
  public get config(): BettererTestConfig<DeserialisedType, SerialisedType, DiffType> {
    return this._config;
  }

  /**
   * When `true`, all other tests will be skipped. Calling `only()` will set this to `true`.
   */
  public get isOnly(): boolean {
    return this._isOnly;
  }

  /**
   * When `true`, this test will be skipped. Calling `skip()` will set this to `true`.
   */
  public get isSkipped(): boolean {
    return this._isSkipped;
  }

  /**
   * Override the constraint in the test configuration.
   *
   * @param constraintOverride - The new constraint for the test.
   * @returns This {@link @betterer/betterer#BettererTest | `BettererTest`}, so it is chainable.
   */
  public constraint(constraintOverride: BettererTestConstraint<DeserialisedType>): this {
    this._config.constraint = constraintOverride;
    return this;
  }

  /**
   * Override the deadline in the test configuration.
   *
   * @param deadlineOverride - The new deadline for the test.
   * @returns This {@link @betterer/betterer#BettererTest | `BettererTest`}, so it is chainable.
   */
  public deadline(deadlineOverride: BettererTestDeadline): this {
    this._config.deadline = createDeadline({ ...this.config, deadline: deadlineOverride });
    return this;
  }

  /**
   * Override the goal in the test configuration.
   *
   * @param goalOverride - The new goal for the test.
   * @returns This {@link @betterer/betterer#BettererTest | `BettererTest`}, so it is chainable.
   */
  public goal(goalOverride: BettererTestGoal<DeserialisedType>): this {
    this._config.goal = createGoal({ ...this.config, goal: goalOverride });
    return this;
  }

  /**
   * Run only this test. All other tests will be marked as skipped.
   *
   * @returns This {@link @betterer/betterer#BettererTest | `BettererTest`}, so it is chainable.
   */
  public only(): this {
    this._isOnly = true;
    return this;
  }

  /**
   * Skip this test.
   *
   * @returns This {@link @betterer/betterer#BettererTest | `BettererTest`}, so it is chainable.
   */
  public skip(): this {
    this._isSkipped = true;
    return this;
  }
}

export function isBettererTest(test: unknown): test is BettererTest {
  return !!test && checkBaseName(test.constructor, BettererTest.name);
}
