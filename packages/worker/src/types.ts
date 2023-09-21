import type { Remote } from 'comlink';

/**
 * @public A pool of {@link https://nodejs.org/api/worker_threads.html | `Worker`s}, which
 * can then be used to queue asynchronous threaded tasks.
 *
 * @remarks It is designed to be used with {@link @betterer/worker#BettererWorkerAPI | `BettererWorkerAPI`} `Worker`s,
 * which are themselves a thin wrapper around {@link https://github.com/GoogleChromeLabs/comlink | `Comlink`}.
 */
export interface BettererWorkerPool<API extends BettererWorkerAPI<unknown>> {
  /**
   * Destroy all the `Worker`s in the pool.
   */
  destroy(): Promise<void>;
  /**
   * Get the next `BettererWorkerHandle` in the pool. Will loop through the whole set of handles
   * so you can distribute a list of tasks evenly.
   */
  getWorkerHandle(): BettererWorkerHandle<API>;
}

/**
 * @public A handle to a `Worker` in a `BettererWorkerPool`.
 *
 * @remarks A handle is in one of the following states:
 *
 * [FREE] - waiting to be used. You can call `claim()` on a handle to reserve access to it.
 * [CLAIMED] - a called has sole access to the handle. You can call `release()` when you're done with it to make it free again.
 * [DESTROYED] - the `Worker` has been detroyed and cannot be claimed again.
 */
export interface BettererWorkerHandle<API extends BettererWorkerAPI<unknown>> {
  /**
   * Claim the current handle to run something in that thread.
   */
  claim(): Promise<API>;
  /**
   * Destroy the current handle so it cannot be used again.
   */
  destroy(): Promise<void>;
  /**
   * Release the handle so another operation can use this thread.
   */
  release(): void;
}

/**
 * @public Wrapper around {@link https://github.com/GoogleChromeLabs/comlink | `Comlink.Remote`} to
 * make it a bit more ergonomic to use/clean up `Worker`s.
 *
 * @remarks The `api` is the remote proxy to the Worker. All functions exposed via this API are
 * transformed to be asynchronous. You may need to use `exposeToWorker__` if you're passing a non-serialisable
 * object to a remote function.
 */
export type BettererWorkerAPI<API> = {
  api: Remote<API>;
  destroy(): Promise<void>;
};

/**
 * @public A factory function that creates a `BettererWorkerAPI` for use in a `BettererWorkerPool`.
 */
export type BettererWorkerFactory<API extends BettererWorkerAPI<unknown>> = () => API;
