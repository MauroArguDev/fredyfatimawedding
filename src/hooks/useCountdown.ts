import { useEffect, useState } from 'react';
import { computeCountdown, type CountdownBreakdown } from '@/lib/countdown';

const TICK_INTERVAL_MS = 1000;

export const useCountdown = (target: Date): CountdownBreakdown => {
  const [breakdown, setBreakdown] = useState(() => computeCountdown(target, new Date()));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBreakdown(computeCountdown(target, new Date()));
    }, TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [target]);

  return breakdown;
};
