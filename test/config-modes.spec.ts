import type { BettererOptions, BettererOptionsRunner, BettererOptionsWatch } from '@betterer/betterer';

import { describe, it } from 'vitest';

function noop(options: unknown): unknown {
  return options;
}

describe('betterer modes', () => {
  it('handles options for running Betterer', () => {
    const start: BettererOptions = { ci: false, precommit: false, strict: false, update: false };
    noop(start);

    const ci: BettererOptions = { ci: true, precommit: false, strict: true, update: false };
    noop(ci);

    const precommit: BettererOptions = { ci: false, precommit: true, strict: true, update: false };
    noop(precommit);

    const update: BettererOptions = { ci: false, precommit: false, strict: false, update: true };
    noop(update);

    const strict: BettererOptions = { ci: false, precommit: false, strict: true, update: false };
    noop(strict);

    // @ts-expect-error `update` cannot be `true` is `strict` is `true`:
    const updateStrictStartError: BettererOptions = { ci: false, strict: true, update: true };
    noop(updateStrictStartError);

    // @ts-expect-error `precommit` cannot be `true` is `ci` is `true`:
    const precommitCIStartError: BettererOptions = { ci: true, precommit: true };
    noop(precommitCIStartError);

    // @ts-expect-error `strict` cannot be `false` is `ci` is `true`:
    const strictCIStartError: BettererOptions = { ci: true, strict: false };
    noop(strictCIStartError);

    // @ts-expect-error `update` cannot be `true` is `ci` is `true`:
    const updateCIStartError: BettererOptions = { ci: true, update: true };
    noop(updateCIStartError);

    // @ts-expect-error `ci` cannot be `true` is `precommit` is `true`:
    const ciPrecommitStartError: BettererOptions = { ci: true, precommit: true };
    noop(ciPrecommitStartError);

    // @ts-expect-error `watch` cannot be `true` is `ci` is `true`:
    const watchCIStartError: BettererOptions = { ci: true, watch: true };
    noop(watchCIStartError);

    // @ts-expect-error `update` cannot be `true` is `precommit` is `true`:
    const updatePrecommitStartError: BettererOptions = { precommit: true, update: true };
    noop(updatePrecommitStartError);

    // @ts-expect-error `watch` cannot be `true` is `precommit` is `true`:
    const watchPrecommitStartError: BettererOptions = { precommit: true, watch: true };
    noop(watchPrecommitStartError);

    // @ts-expect-error `watch` cannot be assigned to `BettererOptionsStart`:
    const watchStartError: BettererOptions = { watch: true };
    noop(watchStartError);

    // @ts-expect-error `ignores` cannot be assigned to `BettererOptionsStart`:
    const ignoresStartError: BettererOptions = { ignores: [] };
    noop(ignoresStartError);

    // @ts-expect-error `ignores` cannot be assigned to `BettererOptionsRunner`:
    const runner: BettererOptionsRunner = { ignores: [] };
    noop(runner);

    // @ts-expect-error `watch` cannot be assigned to `BettererOptionsRunner`:
    const watchRunnerError: BettererOptionsRunner = { watch: true };
    noop(watchRunnerError);

    const watch: BettererOptionsWatch = { ignores: [], watch: true };
    noop(watch);

    // @ts-expect-error `ci` cannot be assigned to `BettererOptionsWatch`:
    const ciWatchError: BettererOptionsWatch = { ci: true };
    noop(ciWatchError);

    // @ts-expect-error `precommit` cannot be assigned to `BettererOptionsWatch`:
    const precommitWatchError: BettererOptionsWatch = { precommit: true };
    noop(precommitWatchError);

    // @ts-expect-error `strict` cannot be assigned to `BettererOptionsWatch`:
    const strictWatchError: BettererOptionsWatch = { strict: true };
    noop(strictWatchError);

    // @ts-expect-error `update` cannot be assigned to `BettererOptionsWatch`:
    const updateWatchError: BettererOptionsWatch = { update: true };
    noop(updateWatchError);

    // @ts-expect-error `watch: false` cannot be assigned to `BettererOptionsWatch`:
    const watchFalseError: BettererOptionsWatch = { watch: false };
    noop(watchFalseError);
  });
});
