import { BettererError } from '@betterer/errors';
import { RequestType } from 'vscode-languageserver/node';

import { BettererRequestParams } from './types';

const POSSIBLE_ERROR_MESSAGES = ['could not read config from', 'for a test to work'];

export const BettererInvalidConfigRequest = new RequestType<BettererRequestParams, void, void>(
  'betterer/invalidConfig'
);

export function isNoConfigError(e: BettererError): boolean {
  return POSSIBLE_ERROR_MESSAGES.some((message) => e.message.startsWith(message));
}
