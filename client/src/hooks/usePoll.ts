import { useEffect, useRef } from 'react';

export function usePoll(callback: () => void | Promise<void>, interval: number, enabled: boolean = true): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const execute = async (): Promise<void> => {
      try {
        await callback();
      } catch (error) {
        console.error('Poll callback error:', error);
      }
    };

    execute();

    intervalRef.current = setInterval(execute, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, interval, enabled]);
}
