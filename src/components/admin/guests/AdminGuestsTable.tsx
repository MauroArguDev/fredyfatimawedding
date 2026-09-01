import type { ReactNode } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/primitives/table';
import { Badge } from '@/components/admin/primitives/badge';
import { Button } from '@/components/admin/primitives/button';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import type { AdminGuest } from '@/schemas/guest';
import type { GuestSortState } from '@/components/admin/guests/filterAndSortGuests';

interface AdminGuestsTableProps {
  guests: readonly AdminGuest[];
  sort: GuestSortState;
  onToggleSort: (key: GuestSortState['key']) => void;
}

const dateFormatter = new Intl.DateTimeFormat('es-SV', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatOpenedAt(value: Date | null): string {
  return value === null ? adminGuestsTableCopy.never : dateFormatter.format(value);
}

const SortableHead = ({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: GuestSortState['direction'];
  onClick: () => void;
}): ReactNode => (
  <TableHead>
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      {label}
      {active && (direction === 'asc' ? ' ▲' : ' ▼')}
    </Button>
  </TableHead>
);

const AdminGuestsTableHeaderRow = ({
  sort,
  onToggleSort,
}: Pick<AdminGuestsTableProps, 'sort' | 'onToggleSort'>): ReactNode => (
  <TableRow>
    <TableHead>{adminGuestsTableCopy.titleLabel}</TableHead>
    <SortableHead
      label={adminGuestsTableCopy.firstName}
      active={sort.key === 'name'}
      direction={sort.direction}
      onClick={() => {
        onToggleSort('name');
      }}
    />
    <TableHead>{adminGuestsTableCopy.lastName}</TableHead>
    <TableHead>{adminGuestsTableCopy.phone}</TableHead>
    <TableHead>{adminGuestsTableCopy.guestLimit}</TableHead>
    <SortableHead
      label={adminGuestsTableCopy.status}
      active={sort.key === 'status'}
      direction={sort.direction}
      onClick={() => {
        onToggleSort('status');
      }}
    />
    <TableHead>{adminGuestsTableCopy.confirmedCount}</TableHead>
    <TableHead>{adminGuestsTableCopy.firstOpenedAt}</TableHead>
  </TableRow>
);

const AdminGuestRow = ({ guest }: { guest: AdminGuest }): ReactNode => (
  <TableRow>
    <TableCell>{guest.titleLabel ?? adminGuestsTableCopy.never}</TableCell>
    <TableCell>{guest.firstName}</TableCell>
    <TableCell>{guest.lastName ?? adminGuestsTableCopy.never}</TableCell>
    <TableCell>{guest.phone}</TableCell>
    <TableCell>{guest.guestLimit}</TableCell>
    <TableCell>
      <Badge variant={guest.confirmed ? 'default' : 'outline'}>
        {guest.confirmed
          ? adminGuestsTableCopy.statusConfirmed
          : adminGuestsTableCopy.statusPending}
      </Badge>
    </TableCell>
    <TableCell>{guest.confirmedCount}</TableCell>
    <TableCell>{formatOpenedAt(guest.firstOpenedAt)}</TableCell>
  </TableRow>
);

export const AdminGuestsTable = ({
  guests,
  sort,
  onToggleSort,
}: AdminGuestsTableProps): ReactNode => {
  return (
    <Table>
      <TableHeader>
        <AdminGuestsTableHeaderRow sort={sort} onToggleSort={onToggleSort} />
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <AdminGuestRow key={guest.id} guest={guest} />
        ))}
      </TableBody>
    </Table>
  );
};
