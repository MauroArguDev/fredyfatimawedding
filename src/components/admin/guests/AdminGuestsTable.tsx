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
import { GuestInviteActions } from '@/components/admin/guests/GuestInviteActions';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import { editGuestDialogCopy } from '@/content/adminGuestForm';
import { deleteGuestDialogCopy, releaseConfirmationDialogCopy } from '@/content/adminGuestActions';
import { adminGuestInviteCopy } from '@/content/adminGuestInvite';
import type { AdminGuest } from '@/schemas/guest';
import type { GuestSortState } from '@/components/admin/guests/filterAndSortGuests';

interface AdminGuestsTableProps {
  guests: readonly AdminGuest[];
  sort: GuestSortState;
  onToggleSort: (key: GuestSortState['key']) => void;
  onEdit: (guest: AdminGuest) => void;
  onDelete: (guest: AdminGuest) => void;
  onReleaseConfirmation: (guest: AdminGuest) => void;
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
    <TableHead>{adminGuestInviteCopy.invitedColumn}</TableHead>
    <TableHead>
      <span className="sr-only">{adminGuestsTableCopy.actionsColumn}</span>
    </TableHead>
  </TableRow>
);

interface AdminGuestRowProps {
  guest: AdminGuest;
  onEdit: (guest: AdminGuest) => void;
  onDelete: (guest: AdminGuest) => void;
  onReleaseConfirmation: (guest: AdminGuest) => void;
}

const AdminGuestRowActions = ({
  guest,
  onEdit,
  onDelete,
  onReleaseConfirmation,
}: AdminGuestRowProps): ReactNode => (
  <div className="flex flex-wrap gap-2">
    <GuestInviteActions guest={guest} />
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        onEdit(guest);
      }}
    >
      {editGuestDialogCopy.trigger}
    </Button>
    {guest.confirmed && (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onReleaseConfirmation(guest);
        }}
      >
        {releaseConfirmationDialogCopy.trigger}
      </Button>
    )}
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() => {
        onDelete(guest);
      }}
    >
      {deleteGuestDialogCopy.trigger}
    </Button>
  </div>
);

const AdminGuestRow = ({
  guest,
  onEdit,
  onDelete,
  onReleaseConfirmation,
}: AdminGuestRowProps): ReactNode => (
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
    <TableCell>
      <Badge variant={guest.invitedAt !== null ? 'default' : 'outline'}>
        {guest.invitedAt !== null
          ? adminGuestInviteCopy.invitedYes
          : adminGuestInviteCopy.invitedNo}
      </Badge>
    </TableCell>
    <TableCell>
      <AdminGuestRowActions
        guest={guest}
        onEdit={onEdit}
        onDelete={onDelete}
        onReleaseConfirmation={onReleaseConfirmation}
      />
    </TableCell>
  </TableRow>
);

export const AdminGuestsTable = ({
  guests,
  sort,
  onToggleSort,
  onEdit,
  onDelete,
  onReleaseConfirmation,
}: AdminGuestsTableProps): ReactNode => {
  return (
    <Table>
      <TableHeader>
        <AdminGuestsTableHeaderRow sort={sort} onToggleSort={onToggleSort} />
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <AdminGuestRow
            key={guest.id}
            guest={guest}
            onEdit={onEdit}
            onDelete={onDelete}
            onReleaseConfirmation={onReleaseConfirmation}
          />
        ))}
      </TableBody>
    </Table>
  );
};
