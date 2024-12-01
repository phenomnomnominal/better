import type { MessagePort, TransferListItem } from 'node:worker_threads';

import type { BettererWorkerAPI } from './types.js';

import { BettererError, invariantΔ, isBettererErrorΔ } from '@betterer/errors';
import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MessageChannel, Worker, parentPort } from 'node:worker_threads';
import callsite from 'callsite';
import { expose, proxy, releaseProxy, transferHandlers, wrap } from 'comlink';

/**
 * @internal This could change at any point! Please don't use!
 *
 * Create a {@link https://nodejs.org/api/worker_threads.html | `Worker`} from a given path.
 * The path should be relative to the file that is calling `importWorkerΔ`. The `Worker` is then
 * wrapped in the {@link https://github.com/GoogleChromeLabs/comlink | `Comlink`} magic, and then our
 * own little wrapper around that.
 *
 * @example You might have something like this, in a file called `my.worker.ts`:
 *
 * ```
 * import { exposeToMainΔ } from '@betterer/worker';
 *
 * export function add (a: number, b: number): number {
 *  return a + b;
 * }
 *
 * exposeToMainΔ({ add });
 * ```
 *
 * Not that `add` is exported, which means you can extract the exposed API:
 *
 * ```
 * import { importWorkerΔ } from '@betterer/worker';
 *
 * type MyWorkerAPI = typeof import('./my.worker.js');
 *
 * const worker = importWorkerΔ<MyWorkerAPI>('./my-worker.js');
 * ```
 *
 * @param importPath - The path to the Worker source. Should have a `.js` extension.
 * Should be relative to the file that is calling `importWorkerΔ`.
 */
export async function importWorkerΔ<T>(importPath: string): Promise<BettererWorkerAPI<T>> {
  const [, call] = callsite();
  invariantΔ(call, `\`call\` should be set!`, call);

  let callerFilePath = call.getFileName();
  try {
    callerFilePath = fileURLToPath(callerFilePath);
  } catch {
    // Was probably already a file path 🤷‍♂️
  }

  const idPath = path.resolve(path.dirname(callerFilePath), importPath);
  const validatedPath = await validatePath(idPath);

  if (process.env.BETTERER_WORKER === 'false') {
    return {
      api: await importDefault<T>(validatedPath),
      destroy: () => Promise.resolve()
    } as BettererWorkerAPI<T>;
  }

  const worker = new Worker(validatedPath);
  const api = wrap(nodeEndpoint(worker));

  return exposeToWorkerΔ({
    api,
    destroy: exposeToWorkerΔ(async () => {
      api[releaseProxy]();
      await worker.terminate();
    })
  } as BettererWorkerAPI<T>);
}

interface ESModule {
  default: unknown;
}

async function importDefault<T>(importPath: string): Promise<T> {
  const m = (await import(importPath)) as unknown;
  return getDefaultExport(m) as T;
}

function getDefaultExport(module: unknown): unknown {
  return (module as ESModule).default || module;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * Use `exposeToMainΔ` to allow the main thread to call Worker functions across the thread boundary.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if it is called from the main thread.
 */
export function exposeToMainΔ(api: object): void {
  if (process.env.BETTERER_WORKER === 'false') {
    return;
  }

  if (!parentPort) {
    throw new BettererError(`"exposeToMainΔ" called from main thread! 🤪`);
  }
  expose(api, nodeEndpoint(parentPort));
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * Use `exposeToWorkerΔ` to allow a Worker to call main thread functions across the thread boundary.
 */
export function exposeToWorkerΔ<Expose extends object>(api: Expose): Expose {
  if (process.env.BETTERER_WORKER === 'false') {
    return api;
  }

  proxy(api);
  return api;
}

interface EventSource {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface Endpoint extends EventSource {
  start?: () => void;
  postMessage(message: unknown, transfer?: Array<Transferable>): void;
}

interface NodeEndpoint {
  start?: () => void;
  postMessage(message: unknown, transfer?: Array<Transferable> | ReadonlyArray<TransferListItem>): void;
  on(type: string, listener: EventListenerOrEventListenerObject): void;
  off(type: string, listener: EventListenerOrEventListenerObject): void;
}

function nodeEndpoint(nep: NodeEndpoint): Endpoint {
  const listeners = new WeakMap<EventListenerOrEventListenerObject, EventListenerOrEventListenerObject>();
  return {
    postMessage: nep.postMessage.bind(nep),
    addEventListener: (_, eh) => {
      const l = (data: unknown) => {
        if ('handleEvent' in eh) {
          eh.handleEvent({ data } as MessageEvent);
        } else {
          eh({ data } as MessageEvent);
        }
      };
      nep.on('message', l);
      listeners.set(eh, l);
    },
    removeEventListener: (_, eh) => {
      const l = listeners.get(eh);
      if (!l) {
        return;
      }
      nep.off('message', l);
      listeners.delete(eh);
    },
    start: nep.start?.bind(nep)
  };
}

interface TransferHandler<T, S> {
  canHandle: (value: unknown) => value is T;
  serialize: (value: T) => [S, Array<Transferable>];
  deserialize: (value: S) => T;
}

interface ThrownValue {
  value: unknown;
}

interface ThrownErrorSerialized {
  isError: true;
  value: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface ThrownBettererErrorSerialized {
  isError: true;
  value: {
    isBettererError: true;
    name: string;
    message: string;
    stack?: string;
    details: Array<string | ThrownErrorSerialized | ThrownBettererErrorSerialized>;
  };
}

type ThrownValueSerialized =
  | ThrownErrorSerialized
  | ThrownBettererErrorSerialized
  | {
      isError: false;
      value: unknown;
    };

async function validatePath(idPath: string): Promise<string> {
  const { name, dir } = path.parse(idPath);
  const tsPath = path.join(dir, `${name}.ts`);

  try {
    await fs.readFile(idPath);
    return idPath;
  } catch {
    // Original path not found, try TypeScript!
  }

  try {
    await fs.readFile(tsPath);
    return tsPath;
  } catch (error) {
    // Not TypeScript either!
    throw new BettererError(`Could not find file at "${idPath}" or "${tsPath}"`, error as Error);
  }
}

function isErrorSerialised(error: unknown): error is ThrownErrorSerialized {
  return !!error && !!(error as Partial<ThrownErrorSerialized>).isError;
}

function isBettererErrorSerialised(error: unknown): error is ThrownBettererErrorSerialized {
  return !!error && !!(error as Partial<ThrownBettererErrorSerialized>).value?.isBettererError;
}

const throwHandler = transferHandlers.get('throw') as TransferHandler<ThrownValue, ThrownValueSerialized>;
assert(throwHandler);

function serializeBettererError(error: BettererError): ThrownBettererErrorSerialized {
  return {
    isError: true,
    value: {
      isBettererError: true,
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error.details.map((detail) => {
        if (isBettererErrorΔ(detail)) {
          return serializeBettererError(detail);
        } else if (detail instanceof Error) {
          assert(throwHandler);
          const [serialisedError] = throwHandler.serialize({ value: detail });
          return serialisedError as ThrownErrorSerialized;
        } else {
          return detail;
        }
      })
    }
  };
}

function deserializeBettererError(serialised: ThrownBettererErrorSerialized): BettererError {
  const { value } = serialised;
  const error = new BettererError(
    value.message,
    ...value.details.map((detail) => {
      if (isBettererErrorSerialised(detail)) {
        return deserializeBettererError(detail);
      } else if (isErrorSerialised(detail)) {
        return { ...new Error(detail.value.message), ...detail.value };
      } else {
        return detail;
      }
    })
  );
  error.stack = serialised.value.stack;
  return error;
}

const originalSerialise = throwHandler.serialize;
throwHandler.serialize = (thrown: ThrownValue) => {
  const { value } = thrown;
  if (isBettererErrorΔ(value)) {
    const serialised = serializeBettererError(value);
    return [serialised, []];
  }
  return originalSerialise(thrown);
};

const originalDeserialise = throwHandler.deserialize;
throwHandler.deserialize = (serialized) => {
  if (isBettererErrorSerialised(serialized)) {
    throw deserializeBettererError(serialized);
  }
  // The structure of `TransferHandler` makes it hard to describe this,
  // but let's just assume it's fine! 🗑️
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- see above!
  throw originalDeserialise(serialized);
};

transferHandlers.set('throw', throwHandler);

const proxyHandler = transferHandlers.get('proxy') as TransferHandler<unknown, MessagePort>;
assert(proxyHandler);

const proxyTransferHandler = {
  ...proxyHandler,
  serialize(obj: unknown) {
    const { port1, port2 } = new MessageChannel();

    expose(obj, nodeEndpoint(port1));

    return [port2, [port2]];
  },
  deserialize(port: MessagePort) {
    port.start();

    return wrap(nodeEndpoint(port));
  }
} as unknown;

transferHandlers.set('proxy', proxyTransferHandler as TransferHandler<unknown, MessagePort>);
