import { useCallback, useEffect, useRef, useState } from 'react';
import { performance } from 'perf_hooks';

const DEFAULT_TASK_TIME_INTERVAL = 100;

export type BettererTimerClear = () => void;

export function useTimer(): [number, BettererTimerClear] {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState(performance.now());

  const updateTime = useCallback(() => {
    setTime(performance.now());
  }, [performance]);

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

  return [time, clearTime];
}
