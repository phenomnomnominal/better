import type { BettererErrorDetails } from './types.js';

/**
 * @public A custom Error for use in **Betterer**. It attaches some extra details to a standard
 * JavaScript error for better logging and debugging.
 *
 * @param message - The error message.
 * @param details - Extra details for the error.
 */
export class BettererError extends Error {
  /**
   * Extra details for the error.
   */
  public details: BettererErrorDetails;
  /**
   * Used to detect that an object is an instance of `BettererError`.
   */
  public isBettererError = true;

  constructor(message: string, ...details: BettererErrorDetails) {
    super(message);

    Error.captureStackTrace(this, BettererError);
    Object.setPrototypeOf(this, new.target.prototype);

    this.details = details;
  }
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * Check if an object is a {@link BettererError | `BettererError`}.
 *
 * @example
 * ```typescript
 * import { BettererError, isBettererErrorΔ } from '@betterer/errors';
 *
 * isBettererErrorΔ(new Error()); // false
 * isBettererErrorΔ(new BettererError()); // true
 * ```
 */
export function isBettererErrorΔ(err: unknown): err is BettererError {
  return !!err && !!(err as Partial<BettererError>).isBettererError;
}
