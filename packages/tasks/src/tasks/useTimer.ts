import { useCallback, useEffect, useRef, useState } from '@betterer/render';
import { getPreciseTimeΔ } from '@betterer/time';

const DEFAULT_TASK_TIME_INTERVAL = 100;

/**
 * @internal This could change at any point! Please don't use!
 *
 * @returns the number of milliseconds since the timer started.
 */
export function useTimer(): number {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState(getPreciseTimeΔ());

  const updateTime = useCallback(() => {
    setTime(getPreciseTimeΔ());
  }, []);

  const clearTime = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
  }, []);

  useEffect(() => {
    timer.current = setInterval(updateTime, DEFAULT_TASK_TIME_INTERVAL);
    updateTime();
    return clearTime;
  }, [updateTime, clearTime]);

  return time;
}
