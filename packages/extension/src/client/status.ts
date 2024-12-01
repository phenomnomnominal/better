import type { StatusBarItem } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

import { StatusBarAlignment, window } from 'vscode';
import { NotificationType, State } from 'vscode-languageclient/node';
import { EXTENSION_NAME } from '../constants.js';
import { BettererStatus } from '../status.js';
import { COMMAND_NAMES } from './commands/index.js';
import { SERVER_PROCESS_ENDED, SERVER_PROCESS_SHUT_DOWN } from './error-messages.js';
import { error } from './logger.js';
import { getAlwaysShowStatus } from './settings.js';

const SERVER_RUNNING = `${EXTENSION_NAME} is running.`;
const SERVER_STOPPED = `${EXTENSION_NAME} stopped.`;

const BettererStatusNotification = new NotificationType<BettererStatus>(`${EXTENSION_NAME}/status`);
const BettererExitCalled = new NotificationType<[number, string]>(`${EXTENSION_NAME}/exitCalled`);

export class BettererStatusBar {
  private _status = BettererStatus.ok;
  private _serverRunning = false;

  private readonly _statusBarItem: StatusBarItem;

  constructor(client: LanguageClient) {
    this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
    this._statusBarItem.text = EXTENSION_NAME;
    this._statusBarItem.command = COMMAND_NAMES.showOutputChannel;
    this._updateStatusBarVisibility();

    void this._initEvents(client);
  }

  public get hasExited(): boolean {
    return this._status === BettererStatus.exit;
  }

  public dispose(): void {
    this._statusBarItem.dispose();
  }

  public update(status: BettererStatus): void {
    this._status = status;
    switch (status) {
      case BettererStatus.warn:
        this._statusBarItem.text = `$(alert) ${EXTENSION_NAME}`;
        break;
      case BettererStatus.error:
        this._statusBarItem.text = `$(issue-opened) ${EXTENSION_NAME}`;
        break;
      case BettererStatus.running:
        this._statusBarItem.text = `$(loading~spin) ${EXTENSION_NAME}`;
        break;
      default:
        this._statusBarItem.text = EXTENSION_NAME;
        break;
    }
    this._updateStatusBarVisibility();
  }

  private async _initEvents(client: LanguageClient): Promise<void> {
    client.onDidChangeState((event) => {
      if (event.newState === State.Running) {
        client.info(this._start());
      } else if (event.newState === State.Stopped) {
        client.info(this._stop());
      }
    });

    await client.onReady();

    client.onNotification(BettererStatusNotification, (status) => {
      this.update(status);
    });
    client.onNotification(BettererExitCalled, (params) => {
      this._exit();
      const [code, message] = params;
      client.error(SERVER_PROCESS_ENDED(code), message, true);
      void error(SERVER_PROCESS_SHUT_DOWN);
    });
  }

  private _start(): string {
    this._statusBarItem.tooltip = SERVER_RUNNING;
    this._serverRunning = true;
    this._updateStatusBarVisibility();
    return SERVER_RUNNING;
  }

  private _stop(): string {
    this._statusBarItem.tooltip = SERVER_STOPPED;
    this._serverRunning = false;
    this._updateStatusBarVisibility();
    return SERVER_STOPPED;
  }

  private _exit(): void {
    this._status = BettererStatus.exit;
  }

  private _showStatusBarItem(show: boolean): void {
    if (show) {
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  private _updateStatusBarVisibility(): void {
    this._showStatusBarItem((this._serverRunning && this._status !== BettererStatus.ok) || getAlwaysShowStatus());
  }
}
