import type { ReactNode } from 'react';
import { Input } from '@/components/admin/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/primitives/select';
import { adminGuestsFiltersCopy } from '@/content/adminGuests';
import type { GuestStatusFilter } from '@/components/admin/guests/filterAndSortGuests';

interface AdminGuestsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: GuestStatusFilter;
  onStatusChange: (value: GuestStatusFilter) => void;
}

export const AdminGuestsFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: AdminGuestsFiltersProps): ReactNode => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        type="search"
        aria-label={adminGuestsFiltersCopy.searchLabel}
        placeholder={adminGuestsFiltersCopy.searchPlaceholder}
        value={search}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
        className="sm:max-w-xs"
      />
      <Select
        value={status}
        onValueChange={(value) => {
          onStatusChange(value as GuestStatusFilter);
        }}
      >
        <SelectTrigger aria-label={adminGuestsFiltersCopy.statusLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{adminGuestsFiltersCopy.statusAll}</SelectItem>
          <SelectItem value="confirmed">{adminGuestsFiltersCopy.statusConfirmed}</SelectItem>
          <SelectItem value="pending">{adminGuestsFiltersCopy.statusPending}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
