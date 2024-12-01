import type { BettererLogger } from '@betterer/logger';
import type { ForegroundColorName } from 'chalk';

import type { BettererTasksState } from './useTasksState.js';

/** @knipignore used by an exported function */
export type BettererTaskColour = ForegroundColorName;

/**
 * @internal This could change at any point! Please don't use!
 *
 * An asynchronous task that will be executed by a {@link BettererTaskLogger | `<BettererTaskLogger/>`}.
 *
 * @param logger - logger for information that will be shown to the user once the task is complete.
 * @param statusLogger - logger for information that will be shown to the user as the task runs.
 *
 * @returns If the task returns it is a "success".
 *
 * @throws If the task throws it is a "failure".
 */
export type BettererTask = (logger: BettererLogger, statusLogger: BettererLogger) => Promise<string | void>;

export type BettererTaskLog = [indicator: string, colour: BettererTaskColour, message: string];

/**
 * @internal This could change at any point! Please don't use!
 *
 * A function that can be used to customise the output of the task status summary.
 *
 * @remarks Useful for custom pluralisation and internationalisation.
 */
export type BettererTasksStatusUpdate = (state: BettererTasksState) => string;
