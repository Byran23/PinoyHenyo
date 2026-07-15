import { useState, useRef, useCallback, useEffect } from "react";

interface UseTimerOptions {
  initialSeconds: number;
  onTimeout: () => void;
  onTick?: (secondsLeft: number) => void;
}

export function useTimer({ initialSeconds, onTimeout, onTick }: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const onTickRef = useRef(onTick);

  onTimeoutRef.current = onTimeout;
  onTickRef.current = onTick;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clear();
          setIsRunning(false);
          setTimeout(() => onTimeoutRef.current(), 0);
          return 0;
        }
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
  }, [clear]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback(
    (newSeconds?: number) => {
      clear();
      setIsRunning(false);
      setSecondsLeft(newSeconds ?? initialSeconds);
    },
    [clear, initialSeconds]
  );

  useEffect(() => {
    return clear;
  }, [clear]);

  return { secondsLeft, isRunning, start, pause, reset };
}
