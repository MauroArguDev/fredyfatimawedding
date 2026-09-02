import { useMemo, useState, type ReactNode } from 'react';
import { AdminGuestsStats } from '@/components/admin/guests/AdminGuestsStats';
import { AdminGuestsFilters } from '@/components/admin/guests/AdminGuestsFilters';
import { AdminGuestsTable } from '@/components/admin/guests/AdminGuestsTable';
import { CreateGuestDialog } from '@/components/admin/guests/CreateGuestDialog';
import { EditGuestDialog } from '@/components/admin/guests/EditGuestDialog';
import { DeleteGuestDialog } from '@/components/admin/guests/DeleteGuestDialog';
import { ReleaseConfirmationDialog } from '@/components/admin/guests/ReleaseConfirmationDialog';
import { RotateTokenDialog } from '@/components/admin/guests/RotateTokenDialog';
import { ExportGuestsButton } from '@/components/admin/guests/ExportGuestsButton';
import {
  filterGuests,
  sortGuests,
  type GuestSortState,
  type GuestStatusFilter,
} from '@/components/admin/guests/filterAndSortGuests';
import { adminGuestsPageCopy } from '@/content/adminGuests';
import type { AdminGuest, GuestStats } from '@/schemas/guest';

interface AdminGuestsBrowserProps {
  guests: readonly AdminGuest[];
  stats: GuestStats;
}

const DEFAULT_SORT: GuestSortState = { key: 'name', direction: 'asc' };

function toggleSortState(current: GuestSortState, key: GuestSortState['key']): GuestSortState {
  if (current.key !== key) {
    return { key, direction: 'asc' };
  }

  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

function clearSelection(setSelected: (value: null) => void): () => void {
  return () => {
    setSelected(null);
  };
}

interface AdminGuestsCrudDialogsProps {
  guestToEdit: AdminGuest | null;
  guestToDelete: AdminGuest | null;
  guestToRelease: AdminGuest | null;
  guestToRotateToken: AdminGuest | null;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onCloseRelease: () => void;
  onCloseRotateToken: () => void;
}

const AdminGuestsCrudDialogs = ({
  guestToEdit,
  guestToDelete,
  guestToRelease,
  guestToRotateToken,
  onCloseEdit,
  onCloseDelete,
  onCloseRelease,
  onCloseRotateToken,
}: AdminGuestsCrudDialogsProps): ReactNode => (
  <>
    <EditGuestDialog guest={guestToEdit} onClose={onCloseEdit} />
    <DeleteGuestDialog guest={guestToDelete} onClose={onCloseDelete} />
    <ReleaseConfirmationDialog guest={guestToRelease} onClose={onCloseRelease} />
    <RotateTokenDialog guest={guestToRotateToken} onClose={onCloseRotateToken} />
  </>
);

interface AdminGuestsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: GuestStatusFilter;
  onStatusChange: (value: GuestStatusFilter) => void;
}

const AdminGuestsToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: AdminGuestsToolbarProps): ReactNode => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <AdminGuestsFilters
      search={search}
      onSearchChange={onSearchChange}
      status={status}
      onStatusChange={onStatusChange}
    />
    <div className="flex gap-2">
      <ExportGuestsButton />
      <CreateGuestDialog />
    </div>
  </div>
);

interface AdminGuestsResultsProps {
  guests: readonly AdminGuest[];
  visibleGuests: readonly AdminGuest[];
  sort: GuestSortState;
  onToggleSort: (key: GuestSortState['key']) => void;
  onEdit: (guest: AdminGuest) => void;
  onDelete: (guest: AdminGuest) => void;
  onReleaseConfirmation: (guest: AdminGuest) => void;
  onRotateToken: (guest: AdminGuest) => void;
}

const AdminGuestsResults = ({
  guests,
  visibleGuests,
  sort,
  onToggleSort,
  onEdit,
  onDelete,
  onReleaseConfirmation,
  onRotateToken,
}: AdminGuestsResultsProps): ReactNode => {
  if (guests.length === 0) {
    return <p className="text-sm text-muted-foreground">{adminGuestsPageCopy.emptyList}</p>;
  }

  if (visibleGuests.length === 0) {
    return <p className="text-sm text-muted-foreground">{adminGuestsPageCopy.emptyFiltered}</p>;
  }

  return (
    <AdminGuestsTable
      guests={visibleGuests}
      sort={sort}
      onToggleSort={onToggleSort}
      onEdit={onEdit}
      onDelete={onDelete}
      onReleaseConfirmation={onReleaseConfirmation}
      onRotateToken={onRotateToken}
    />
  );
};

export const AdminGuestsBrowser = ({ guests, stats }: AdminGuestsBrowserProps): ReactNode => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<GuestStatusFilter>('all');
  const [sort, setSort] = useState<GuestSortState>(DEFAULT_SORT);
  const [guestToEdit, setGuestToEdit] = useState<AdminGuest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<AdminGuest | null>(null);
  const [guestToRelease, setGuestToRelease] = useState<AdminGuest | null>(null);
  const [guestToRotateToken, setGuestToRotateToken] = useState<AdminGuest | null>(null);

  const visibleGuests = useMemo(
    () => sortGuests(filterGuests(guests, search, status), sort),
    [guests, search, status, sort],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminGuestsStats stats={stats} />
      <AdminGuestsToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      <AdminGuestsResults
        guests={guests}
        visibleGuests={visibleGuests}
        sort={sort}
        onToggleSort={(key) => {
          setSort((current) => toggleSortState(current, key));
        }}
        onEdit={setGuestToEdit}
        onDelete={setGuestToDelete}
        onReleaseConfirmation={setGuestToRelease}
        onRotateToken={setGuestToRotateToken}
      />
      <AdminGuestsCrudDialogs
        guestToEdit={guestToEdit}
        guestToDelete={guestToDelete}
        guestToRelease={guestToRelease}
        guestToRotateToken={guestToRotateToken}
        onCloseEdit={clearSelection(setGuestToEdit)}
        onCloseDelete={clearSelection(setGuestToDelete)}
        onCloseRelease={clearSelection(setGuestToRelease)}
        onCloseRotateToken={clearSelection(setGuestToRotateToken)}
      />
    </div>
  );
};
