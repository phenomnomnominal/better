/**
 * @public Utility type to allow results that are async or sync.
 */
export type MaybeAsync<T> = T | Promise<T>;

/**
 * @public Utility type for Function-like things:
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- it izz what it izz
export type Func = (...args: Array<any>) => any;
