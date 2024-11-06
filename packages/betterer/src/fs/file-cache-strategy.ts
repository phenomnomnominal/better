/**
 * @public Different possible cache strategies to use for a {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest`}.
 */
export enum BettererCacheStrategy {
  /**
   * Used when changes to one file cannot impact the results of other files, e.g. linting, syntax. Individual files results can be re-used if a file is unchanged.
   */
  FilePath = 'FilePath',
  /**
   * Used when changes in one file *can* impact the results of other files, e.g. full compilation. Full test results can be re-used if all files are unchanged.
   */
  FilePaths = 'FilePaths'
}
