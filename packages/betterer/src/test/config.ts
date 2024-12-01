import type {
  BettererDiff,
  BettererDiffer,
  BettererPrinter,
  BettererProgress,
  BettererSerialiser,
  BettererTestConfig,
  BettererTestConstraint,
  BettererTestFunction,
  BettererTestGoal,
  BettererTestOptions
} from './types.js';

import { BettererError } from '@betterer/errors';
import { format } from 'prettier';

import { isFunction } from '../utils.js';

export class BettererTestConfigΩ<DeserialisedType = number, SerialisedType = DeserialisedType, DiffType = null>
  implements BettererTestConfig<DeserialisedType, SerialisedType, DiffType>
{
  public constraint: BettererTestConstraint<DeserialisedType>;
  public goal: BettererTestGoal<DeserialisedType>;
  public deadline: number;

  constructor(private _options: BettererTestOptions<DeserialisedType, SerialisedType, DiffType>) {
    // The `createTestConfig` function could be called from JS code, without type-checking.
    // We *could* change the parameter to be `Partial<BettererTestOptions<...>>`,
    // but that would imply that it was optional, but it isn't.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
    if (this._options.constraint == null) {
      throw new BettererError('for a test to work, it must have a `constraint` function. ❌');
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
    if (this._options.test == null) {
      throw new BettererError('for a test to work, it must have a `test` function. ❌');
    }

    this.constraint = this._options.constraint;
    this.deadline = createDeadline(this._options);
    this.goal = createGoal(this._options);
  }

  public get differ(): BettererDiffer<DeserialisedType, DiffType> {
    return this._options.differ ?? (this._defaultDiffer as BettererDiffer<DeserialisedType, DiffType>);
  }

  public get printer(): BettererPrinter<SerialisedType> {
    return this._options.printer ?? this._defaultPrinter;
  }

  public get progress(): BettererProgress<DeserialisedType> {
    return this._options.progress ?? this._defaultProgress;
  }

  public get serialiser(): BettererSerialiser<DeserialisedType, SerialisedType> {
    const defaultSerialiser = {
      deserialise: this._defaultDeserialiser,
      serialise: this._defaultSerialiser
    } as BettererSerialiser<DeserialisedType, SerialisedType>;
    return this._options.serialiser ?? defaultSerialiser;
  }

  public get test(): BettererTestFunction<DeserialisedType> {
    return this._options.test;
  }

  private _defaultDiffer = (): BettererDiff<DiffType> => {
    return {
      diff: null
    } as BettererDiff<DiffType>;
  };

  private _defaultPrinter = async (serialised: unknown): Promise<string> => {
    return await format(JSON.stringify(serialised), { parser: 'json' });
  };

  private _defaultProgress = (): null => {
    return null;
  };

  private _defaultDeserialiser = (serialised: unknown): unknown => {
    return serialised;
  };

  private _defaultSerialiser = (deserialised: unknown): unknown => {
    return deserialised;
  };
}

export function createDeadline<DeserialisedType, SerialisedType, DiffType>(
  options: Pick<BettererTestOptions<DeserialisedType, SerialisedType, DiffType>, 'deadline'>
): number {
  const { deadline } = options;
  if (deadline == null) {
    return Infinity;
  }
  const parsed = new Date(deadline).getTime();
  if (isNaN(parsed)) {
    throw new BettererError(`invalid deadline: ${String(deadline)}`);
  }
  return parsed;
}

export function createGoal<DeserialisedType, SerialisedType, DiffType>(
  options: Pick<BettererTestOptions<DeserialisedType, SerialisedType, DiffType>, 'goal'>
): BettererTestGoal<DeserialisedType> {
  const { goal } = options;
  if (goal == null) {
    return () => false;
  }
  if (isFunction(goal)) {
    return goal as BettererTestGoal<DeserialisedType>;
  }
  return (value: DeserialisedType): boolean => value === goal;
}
