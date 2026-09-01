import type { ReactNode } from 'react';
import type { GuestStats } from '@/schemas/guest';
import { adminGuestsStatsCopy } from '@/content/adminGuests';

interface AdminGuestsStatsProps {
  stats: GuestStats;
}

interface StatEntry {
  label: string;
  value: number;
}

export const AdminGuestsStats = ({ stats }: AdminGuestsStatsProps): ReactNode => {
  const entries: StatEntry[] = [
    { label: adminGuestsStatsCopy.total, value: stats.total },
    { label: adminGuestsStatsCopy.confirmed, value: stats.confirmed },
    { label: adminGuestsStatsCopy.pending, value: stats.pending },
    { label: adminGuestsStatsCopy.openedNotConfirmed, value: stats.openedNotConfirmed },
    { label: adminGuestsStatsCopy.totalConfirmedPeople, value: stats.totalConfirmedPeople },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map((entry) => (
        <div key={entry.label} className="rounded-lg border border-border p-3">
          <dt className="text-xs text-muted-foreground">{entry.label}</dt>
          <dd className="text-2xl font-semibold">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
};
