import type {
  BettererOptionsReporters,
  BettererReporter,
  BettererReporterFactory,
  BettererReporterModule
} from './types.js';

import { BettererError, invariantΔ } from '@betterer/errors';
import path from 'node:path';

import { importDefault, importTranspiled } from '../fs/index.js';
import { BettererRunLoggerΩ } from '../run/index.js';
import { isFunction, isString } from '../utils.js';
import { BettererReporterΩ } from './reporter.js';

const REPORTER_HOOK_NAMES = Object.getOwnPropertyNames(BettererReporterΩ.prototype) as ReadonlyArray<
  keyof BettererReporter
>;
const RUN_LOGGER_HOOK_NAMES = Object.getOwnPropertyNames(BettererRunLoggerΩ.prototype) as ReadonlyArray<
  keyof BettererRunLoggerΩ
>;

export async function loadDefaultReporter(): Promise<BettererReporterΩ> {
  const reporterFactory = await importDefault('@betterer/reporter');
  assertDefaultReporter(reporterFactory);
  return new BettererReporterΩ([reporterFactory.createReporterΔ()]);
}

function assertDefaultReporter(reporterFactory: unknown): asserts reporterFactory is BettererReporterFactory {
  invariantΔ(
    (reporterFactory as Partial<BettererReporterFactory>).createReporterΔ,
    `"@betterer/reporter" didn't provider a reporter factory!`
  );
}

export async function loadReporters(reporters: BettererOptionsReporters, cwd: string): Promise<BettererReporterΩ> {
  if (reporters.length === 0) {
    return await loadDefaultReporter();
  }

  return new BettererReporterΩ(
    await Promise.all(
      reporters.map(async (reporter) => {
        if (isString(reporter)) {
          reporter = await resolveReporter(cwd, reporter);
          try {
            const module = path.extname(reporter) ? await importTranspiled(reporter) : await importDefault(reporter);
            assertReporter(reporter, module);
            validate(module.reporter, REPORTER_HOOK_NAMES);
            return module.reporter;
          } catch (error) {
            throw new BettererError(`could not import "${reporter}". 😔`, error as BettererError);
          }
        }
        validate(reporter, REPORTER_HOOK_NAMES);
        return reporter;
      })
    )
  );
}

function assertReporter(reporter: string, reporterModule: unknown): asserts reporterModule is BettererReporterModule {
  if (!reporterModule || !(reporterModule as Partial<BettererReporterModule>).reporter) {
    throw new BettererError(`"${reporter}" didn't create a reporter. 😔`);
  }
}

export function loadSilentReporter(): BettererReporterΩ {
  return new BettererReporterΩ([]);
}

function validate(result: unknown, hookNames: ReadonlyArray<string>): asserts result is BettererReporter {
  const reporter = result as BettererReporter;
  Object.keys(reporter).forEach((key) => {
    const hookName = key as keyof BettererReporter;
    if (key === 'runLogger') {
      validate(reporter.runLogger, RUN_LOGGER_HOOK_NAMES);
      return;
    }
    if (!hookNames.includes(hookName)) {
      throw new BettererError(`"${hookName}" is not a valid reporter hook name. 😔`);
    }
    if (!isFunction(reporter[hookName])) {
      throw new BettererError(`"${hookName}" is not a function. 😔`);
    }
  });
}

async function resolveReporter(cwd: string, reporter: string): Promise<string> {
  try {
    // Local reporter:
    const localReporterPath = path.resolve(cwd, reporter);
    await import(localReporterPath);
    return localReporterPath;
  } catch {
    // npm module:
    return reporter;
  }
}
