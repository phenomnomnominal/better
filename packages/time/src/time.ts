/**
 * @internal This could change at any point! Please don't use!
 *
 * @remarks can be stubbed to have control of time during tests.
 */
export function getPreciseTimeΔ(): number {
  return performance.now();
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * @remarks can be stubbed to have control of time during tests.
 */
export function getTimeΔ(): number {
  return Date.now();
}
