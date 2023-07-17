/**
 * Constraint helpers for writing {@link https://github.com/phenomnomnominal/betterer | **Betterer**}
 * tests.
 *
 * @remarks A `constraint` function is responsible for comparing two **Betterer** test results and
 * determining if the newer result
 * is `better`, `worse` or the `same`.
 *
 * @packageDocumentation
 */

export { BettererConstraintResult } from './constraint-result.js';

export { bigger } from './bigger.js';
export { smaller } from './smaller.js';
