import type { BettererConstraintResult } from '@betterer/constraints';

import type { BettererDelta, BettererRun } from '../run/index.js';
import type { MaybeAsync } from '../types.js';

/**
 * @public A function that checks if a test result is {@link @betterer/constraints#BettererConstraintResult | `better`, `worse`, or the `same`}
 * than the expected result.
 *
 * @example
 * ```typescript
 * import { BettererConstraintResult } from '@betterer/constraints';
 *
 * export function bigger(result: number, expected: number): BettererConstraintResult {
 *   if (result === expected) {
 *     return BettererConstraintResult.same;
 *   }
 *  if (result > expected) {
 *     return BettererConstraintResult.better;
 *   }
 *   return BettererConstraintResult.worse;
 * }
 * ```
 *
 * @param result - Result from the current test run.
 * @param expected - Expected result from the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
 */
export type BettererTestConstraint<DeserialisedType> = (
  this: BettererRun,
  result: DeserialisedType,
  expected: DeserialisedType
) => MaybeAsync<BettererConstraintResult>;

/**
 * @public The date when the test should be completed by. The test will be marked as `expired` if
 * it runs after the specified date.
 */
export type BettererTestDeadline = Date | string;

/**
 * @public A function that runs the actual test.
 *
 * @example
 * ```typescript
 * import { BettererRun } from '@betterer/betterer';
 *
 * export function test (run: BettererRun): number {
 *   const numberOfJavaScriptFiles = countJavaScriptFiles(run.filePaths);
 *   return numberOfJavaScriptFiles;
 * }
 * ```
 *
 * @param run - The current run.
 */
export type BettererTestFunction<DeserialisedType> = (
  this: BettererRun,
  run: BettererRun
) => MaybeAsync<DeserialisedType>;

/**
 * @public A function that returns whether the test has met its goal.
 *
 * @example
 * ```typescript
 * export function goal (result: number): boolean {
 *   return result === 0;
 * }
 * ```
 *
 * @param result - Result from the current test run.
 */
export type BettererTestGoal<DeserialisedType> = (this: BettererRun, result: DeserialisedType) => MaybeAsync<boolean>;

/**
 * @public The result of computing the difference between two results.
 */
export interface BettererDiff<DiffType = null> {
  /**
   * The difference between `expected` and `result`.
   */
  diff: DiffType;
}

/**
 * @public A function that compares two test results.
 *
 * @param expected - Expected result from the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
 * @param result - Result from the current test run.
 */
export type BettererDiffer<DeserialisedType, DiffType> = (
  this: BettererRun,
  expected: DeserialisedType,
  result: DeserialisedType
) => MaybeAsync<BettererDiff<DiffType>>;

/**
 * @public A function that converts a serialised test result into the string that will be saved in
 * the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
 *
 * @param serialised - The serialised result.
 */
export type BettererPrinter<SerialisedType> = (serialised: SerialisedType) => MaybeAsync<string>;

/**
 * @public A function that converts a test result to a numeric value that represents the progress towards
 * the goal.
 *
 * @param baseline - The baseline result for the test.
 * @param result - The result from the current test run.
 */
export type BettererProgress<DeserialisedType> = (
  this: BettererRun,
  baseline: DeserialisedType | null,
  result: DeserialisedType | null
) => MaybeAsync<BettererDelta | null>;

/**
 * @public The function that converts from a `DeserialisedType` to a `SerialisedType`.
 *
 * @param result - The result from the current test run.
 * @param resultsPath - The path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
 */
export type BettererSerialise<DeserialisedType, SerialisedType> = (
  this: BettererRun,
  result: DeserialisedType,
  resultsPath: string
) => SerialisedType;

/**
 * @public The function that converts from a `SerialisedType` to a `DeserialisedType`.
 *
 * @param serialised - The serialised result.
 * @param resultsPath - The path to the {@link https://phenomnomnominal.github.io/betterer/docs/results-file | results file}.
 */
export type BettererDeserialise<DeserialisedType, SerialisedType> = (
  serialised: SerialisedType,
  resultsPath: string
) => DeserialisedType;

/**
 * @public The functions that convert between `SerialisedType` and `DeserialisedType`.
 */
export interface BettererSerialiser<DeserialisedType, SerialisedType = DeserialisedType> {
  /**
   * The function that converts from a `DeserialisedType` to a `SerialisedType`.
   */
  serialise: BettererSerialise<DeserialisedType, SerialisedType>;
  /**
   * The function that converts from a `SerialisedType` to a `DeserialisedType`.
   */
  deserialise: BettererDeserialise<DeserialisedType, SerialisedType>;
}

/**
 * @public Options for creating a {@link @betterer/betterer#BettererTest | `BettererTest`}.
 *
 * @remarks The options object will be validated by **Betterer** and turned into a {@link @betterer/betterer#BettererTestConfig | `BettererTestConfig`}.
 * There is a lot of power (and therefore complexity) in this options object.
 *
 * The default version of a {@link @betterer/betterer#BettererTest | `BettererTest` }
 * operates on simple numbers and can be defined with just a few properties.
 *
 * For a more complex version of a {@link @betterer/betterer#BettererTest | `BettererTest`} that
 * operates on more complex objects, you need to define more complex behaviour.
 *
 * @typeParam DeserialisedType - The deserialised result type of a test.
 * @typeParam SerialisedType - The serialised type of a test result.
 * @typeParam DiffType - The diff between two results.
 */
export interface BettererTestOptions<DeserialisedType, SerialisedType, DiffType> {
  /**
   * The constraint function for the test.
   */
  constraint: BettererTestConstraint<DeserialisedType>;
  /**
   * A hook to perform any configuration before running the test.
   */
  test: BettererTestFunction<DeserialisedType>;
  /**
   * The function that compares two test results.
   */
  differ?: BettererDiffer<DeserialisedType, DiffType>;
  /**
   * The function that converts a serialised test result to the string that will be saved in the [test results file](./results-file)
   */
  printer?: BettererPrinter<SerialisedType>;
  /**
   * The function that converts a test result to a numeric value that represents the progress towards the goal.
   */
  progress?: BettererProgress<DeserialisedType>;
  /**
   * The functions that serialises and deserialises a test result between the [`DeserialisedType`](#deserialisedtype-default-unknown) and [`SerialisedType`](#serialisedtype-default-deserialisedtype).
   */
  serialiser?: BettererSerialiser<DeserialisedType, SerialisedType>;
  /**
   * The goal function or goal value for the test.
   */
  goal: DeserialisedType | BettererTestGoal<DeserialisedType>;
  /**
   * The deadline for the test.
   *
   * @remarks Will be transformed into a UNIX timestamp.
   */
  deadline?: BettererTestDeadline;
}

/**
 * @public The validated configuration for a {@link @betterer/betterer#BettererTest | `BettererTest`}.
 */
export interface BettererTestConfig<DeserialisedType = unknown, SerialisedType = DeserialisedType, DiffType = null> {
  /**
   * The constraint function for the test.
   */
  readonly constraint: BettererTestConstraint<DeserialisedType>;
  /**
   * The deadline for the test, as a UNIX timestamp.
   */
  readonly deadline: number;
  /**
   * The goal function for the test.
   */
  readonly goal: BettererTestGoal<DeserialisedType>;
  /**
   * The function that runs the actual test.
   */
  readonly test: BettererTestFunction<DeserialisedType>;
  /**
   * The function that compares two test results.
   */
  readonly differ: BettererDiffer<DeserialisedType, DiffType>;
  /**
   * The function that converts a serialised test result to the string that will be saved in the [test results file](./results-file)
   */
  readonly printer: BettererPrinter<SerialisedType>;
  /**
   * The function that converts a test result to a numeric value that represents the progress towards the goal.
   */
  readonly progress: BettererProgress<DeserialisedType>;
  /**
   * The functions that serialises and deserialises a test result between the [`DeserialisedType`](#deserialisedtype-default-unknown) and [`SerialisedType`](#serialisedtype-default-deserialisedtype).
   */
  readonly serialiser: BettererSerialiser<DeserialisedType, SerialisedType>;
}
