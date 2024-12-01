import assert from 'node:assert';

import { BettererError } from './error.js';

/**
 * @internal This could change at any point! Please don't use!
 *
 * A slightly fancier assertion for when we're confident about the truthiness
 * of some value.
 *
 * @remarks Useful for validating indexed access.
 *
 * @example
 * ```typescript
 * const [, call] = callsite();
 * invariantΔ(call, `\`call\` should be set!`, call);
 * ```
 *
 * @param check - Invariant to check. This *should* always be truthy.
 * @param message - Information about why we think the `check` should pass.
 * @param values - Additional values to assist if the invariant is wrong.
 */
export function invariantΔ(check: unknown, message: `${string}!`, ...values: Array<unknown>): asserts check {
  try {
    assert(check);
  } catch {
    throw new BettererError(`${message} 🤔`, ...values.map((value) => JSON.stringify(value)));
  }
}
