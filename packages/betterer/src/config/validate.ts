import assert from 'node:assert';

import { BettererError, invariantΔ } from '@betterer/errors';

import { read, readdir } from '../fs/index.js';
import { isBoolean, isNumber, isRegExp, isString, isUndefined } from '../utils.js';

function getKeyValue(config: object): [string, unknown] {
  const [key] = Object.keys(config);
  invariantΔ(key, `No keys found on validation config!`, config);
  const value = config[key as keyof typeof config];
  return [key, value];
}

export function validateBool<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validate(isBoolean(value), `"${key}" must be \`true\` or \`false\`. ${received(value)}`);
  return config;
}

export function validateString<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validate(isString(value), `"${key}" must be a string. ${received(value)}`);
  return config;
}

export async function validateFilePath<Config extends object>(config: Config): Promise<Config> {
  const [key, value] = getKeyValue(config);
  validate(
    value == null || (isString(value) && (await read(value)) !== null),
    `"${key}" must be a path to a file. ${received(value)}`
  );
  return config;
}

export async function validateDirectory<Config extends object>(config: Config): Promise<Config> {
  const [key, value] = getKeyValue(config);
  validate(
    value == null || (isString(value) && (await readdir(value)) !== null),
    `"${key}" must be a path to a directory. ${received(value)}`
  );
  return config;
}

function validateNumber<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validate(isNumber(value), `"${key}" must be a number. ${received(value)}`);
  return config;
}

export function validateStringArray<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validateStringOrArray(config);
  validate(
    !Array.isArray(value) || value.every((item) => isString(item)),
    `"${key}" must be an array of strings. ${received(value)}`
  );
  return config;
}

function validateStringOrArray<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validate(isString(value) || Array.isArray(value), `"${key}" must be a string or an array. ${received(value)}`);
  return config;
}

export function validateStringRegExpArray<Config extends object>(config: Config): Config {
  const [key, value] = getKeyValue(config);
  validateStringOrArray(config);
  validate(
    !Array.isArray(value) || value.every((item) => isString(item) || isRegExp(item)),
    `"${key}" must be an array of strings or RegExps. ${received(value)}`
  );
  return config;
}

export async function validateWorkers(workers: number | boolean = true): Promise<number> {
  const { cpus } = await import('node:os');
  const totalCPUs = cpus().length;

  if (workers === true || isUndefined(workers)) {
    workers = totalCPUs >= 4 ? totalCPUs - 2 : false;
  }
  if (workers === false || workers === 0) {
    process.env.BETTERER_WORKER = 'false';
    // When disabled, set workers to 1 so that the BettererWorkerPool
    // can be instantiated correctly:
    workers = 1;
  }

  validateNumber({ workers });
  validate(
    isNumber(workers) && workers > 0 && workers <= totalCPUs,
    `"workers" must be more than zero and not more than the number of available CPUs (${String(totalCPUs)}). To disable workers, set to \`false\`. ${received(
      workers
    )}`
  );
  return workers;
}

function validate(value: unknown, message: string): asserts value {
  assert(value, new BettererError(message));
}

function received(value: unknown): string {
  return `Received \`${JSON.stringify(value)}\`.`;
}
