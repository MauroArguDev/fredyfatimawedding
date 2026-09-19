const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const PAST_DEADLINE_BREAKDOWN: CountdownBreakdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: true,
};

export const computeCountdown = (target: Date, now: Date): CountdownBreakdown => {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return PAST_DEADLINE_BREAKDOWN;
  }

  const totalSeconds = Math.floor(diffMs / MS_PER_SECOND);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const hours = totalHours % HOURS_PER_DAY;
  const days = Math.floor(totalHours / HOURS_PER_DAY);

  return { days, hours, minutes, seconds, isPast: false };
};
