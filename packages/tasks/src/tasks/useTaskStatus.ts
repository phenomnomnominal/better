import type { BettererLogger, BettererLoggerCodeInfo, BettererLoggerMessage, BettererLog } from '@betterer/logger';

import { useRef, useState } from '@betterer/render';

export function useTaskStatus(): [BettererLog, BettererLogger] {
  const [status, setStatus] = useState<BettererLog>({});

  const logger = useRef({
    code(code: BettererLoggerCodeInfo): void {
      setStatus({ code });
    },
    debug(debug: BettererLoggerMessage): void {
      setStatus({ debug });
    },
    error(error: BettererLoggerMessage): void {
      setStatus({ error });
    },
    info(info: BettererLoggerMessage): void {
      setStatus({ info });
    },
    progress(progress: BettererLoggerMessage): void {
      setStatus({ progress });
    },
    success(success: BettererLoggerMessage): void {
      setStatus({ success });
    },
    warn(warn: BettererLoggerMessage): void {
      setStatus({ warn });
    }
  });

  return [status, logger.current];
}
