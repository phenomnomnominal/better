import type { BettererLogger, BettererLoggerCodeInfo, BettererLoggerMessage, BettererLogs } from '@betterer/logger';

import { useRef, useState } from '@betterer/render';

export function useTaskLogs(): [BettererLogs, BettererLogger] {
  const [logs, setLogs] = useState<BettererLogs>([]);

  const logger = useRef({
    progress(progress: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { progress }]);
    },
    code(code: BettererLoggerCodeInfo): void {
      setLogs((logs) => [...logs, { code }]);
    },
    debug(debug: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { debug }]);
    },
    error(error: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { error }]);
    },
    info(info: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { info }]);
    },
    success(success: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { success }]);
    },
    warn(warn: BettererLoggerMessage): void {
      setLogs((logs) => [...logs, { warn }]);
    }
  });

  return [logs, logger.current];
}
