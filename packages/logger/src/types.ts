/**
 * @public A message to be logged.
 */
export type BettererLoggerMessage = string;

/**
 * @public An array of {@link BettererLoggerMessage | `BettererLoggerMessage`s} to be logged.
 */
export type BettererLoggerMessages = Array<BettererLoggerMessage>;

/**
 * @public A function that takes an array of {@link BettererLoggerMessage | `BettererLoggerMessage`s }
 * and logs them asynchronously.
 */
export type BettererLogMessage = (...messages: BettererLoggerMessages) => MaybeAsync<void>;

/**
 * @public The information required to log a code block with a message.
 */
export interface BettererLoggerCodeInfo {
  /**
   * A message to attach to the code snippet.
   */
  message: string;
  /**
   * The path to the file containing code.
   */
  filePath: string;
  /**
   * The text content of the file.
   */
  fileText: string;
  /**
   * The `0`-indexed line number of the start of the code snippet in the file.
   */
  line: number;
  /**
   * The `0`-indexed column number of the start of the code snippet in the line.
   */
  column: number;
  /**
   * The length of the code snippet.
   */
  length: number;
}

/**
 * @public A function that takes a {@link BettererLoggerCodeInfo | `BettererLoggerCodeInfo` }
 * and logs it asynchronously.
 */
export type BettererLogCode = (codeInfo: BettererLoggerCodeInfo) => MaybeAsync<void>;

/**
 * @public The interface for **Betterer** logging.
 */
export interface BettererLogger {
  /**
   * Log a code snippet
   */
  code: BettererLogCode;
  /**
   * Log a debug message
   */
  debug: BettererLogMessage;
  /**
   * Log an error message
   */
  error: BettererLogMessage;
  /**
   * Log an informative message
   */
  info: BettererLogMessage;
  /**
   * Log a progress message
   */
  progress: BettererLogMessage;
  /**
   * Log a success message
   */
  success: BettererLogMessage;
  /**
   * Log a warning message
   */
  warn: BettererLogMessage;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * A logging instruction which can be logged at a later time.
 */
export interface BettererLog {
  /**
   * A code snippet to be logged.
   */
  code?: BettererLoggerCodeInfo;
  /**
   * A debug message to be logged.
   */
  debug?: BettererLoggerMessage;
  /**
   * An error message to be logged.
   */
  error?: BettererLoggerMessage;
  /**
   * An informative message to be logged.
   */
  info?: BettererLoggerMessage;
  /**
   * A progress message to be logged.
   */
  progress?: BettererLoggerMessage;
  /**
   * A success message to be logged.
   */
  success?: BettererLoggerMessage;
  /**
   * A warning message to be logged.
   */
  warn?: BettererLoggerMessage;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * A set of logging instructions which can be logged at a later time.
 */
export type BettererLogs = Array<BettererLog>;

/**
 * @public Utility type to allow results that are async or sync.
 */
export type MaybeAsync<T> = T | Promise<T>;
