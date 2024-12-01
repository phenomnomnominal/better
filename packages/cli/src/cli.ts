import type { BettererErrorDetails } from '@betterer/errors';
import type { BettererCLIArguments, BettererCommandName } from './types.js';

import { isBettererErrorΔ } from '@betterer/errors';
import { Command } from 'commander';

import { ci } from './ci.js';
import { init } from './init.js';
import { merge } from './merge.js';
import { precommit } from './precommit.js';
import { start } from './start.js';
import { results } from './results.js';
import { BettererCommand } from './types.js';
import { watch } from './watch.js';
import { upgrade } from './upgrade.js';
import { getVersion } from './version.js';

/**
 * @internal This could change at any point! Please don't use!
 *
 * Run the **Betterer** command-line interface.
 */
export async function cliΔ(
  cwd: string,
  argv: BettererCLIArguments,
  isCI = process.env.CI === 'true',
  isTest = process.env.TEST === 'true'
): Promise<void> {
  const program = new Command('Betterer');
  const version = await getVersion();
  program.version(version);

  // Init:
  program.addCommand(init(cwd));

  // Run:
  program.addCommand(start(cwd, isCI));
  program.addCommand(watch(cwd));

  // Precommit:
  // Throw if test run is worse, `git add` if better
  program.addCommand(precommit(cwd));

  // CI:
  // Throw if test run creates a diff
  program.addCommand(ci(cwd));

  // Merge:
  program.addCommand(merge(cwd));

  // Results:
  program.addCommand(results(cwd));

  // Upgrade:
  program.addCommand(upgrade(cwd));

  const args = argv.slice(0);
  const [, , command] = args;
  // `BettererCommand` is an enum, so this conditional *is* necessary!
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (!BettererCommand[command as BettererCommandName]) {
    args.splice(2, 0, BettererCommand.start);
  }

  try {
    await program.parseAsync(args);
  } catch (error) {
    if (isBettererErrorΔ(error)) {
      error.details = flattenErrors(error.details);
    }
    if (!isTest) {
      /* v8 ignore next */
      process.exitCode = 1;
    }
    throw error;
  }
}

function flattenErrors(details: BettererErrorDetails): BettererErrorDetails {
  return details
    .flatMap((detail) => {
      if (isBettererErrorΔ(detail)) {
        const flattened = [detail, ...flattenErrors(detail.details)];
        detail.details = [];
        return flattened;
      }
      return detail;
    })
    .map((detail) => {
      const error = new Error();
      if (isError(detail)) {
        error.message = detail.message;
        error.name = detail.name;
        error.stack = detail.stack;
      } else {
        error.message = detail;
      }
      return error;
    });
}

function isError(value: unknown): value is Error {
  const { message, stack } = value as Partial<Error>;
  return message != null && stack != null;
}
