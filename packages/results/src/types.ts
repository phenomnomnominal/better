/**
 * The result object for a single run of a single {@link @betterer/betterer#BettererTest | `BettererTest`}.
 * The `value` is serialised and then `JSON.stringify()`-ed, so it needs
 * to be `JSON.parse()`-ed and then deserialised to be useful.
 *
 * @public
 */
export type BettererResult = {
  value: string;
};

/**
 * The results object for a single run of a suite of {@link @betterer/betterer#BettererTest | `BettererTest`-s}.
 * Each key is the `name` of a test, and the value is the {@link BettererResult | serialised result}.
 *
 * @public
 */
export type BettererResults = Record<string, BettererResult>;
