import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminGuestsFilters } from '@/components/admin/guests/AdminGuestsFilters';
import { adminGuestsFiltersCopy } from '@/content/adminGuests';

describe('AdminGuestsFilters', () => {
  it('callsOnSearchChangeAsTheUserTypes', async () => {
    const onSearchChange = vi.fn();

    render(
      <AdminGuestsFilters
        search=""
        onSearchChange={onSearchChange}
        status="all"
        onStatusChange={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText(adminGuestsFiltersCopy.searchLabel), 'ana');

    expect(onSearchChange).toHaveBeenCalledTimes(3);
    expect(onSearchChange).toHaveBeenLastCalledWith('a');
  });

  it('callsOnStatusChangeWhenAnOptionIsPicked', async () => {
    const onStatusChange = vi.fn();

    render(
      <AdminGuestsFilters
        search=""
        onSearchChange={vi.fn()}
        status="all"
        onStatusChange={onStatusChange}
      />,
    );

    await userEvent.click(
      screen.getByRole('combobox', { name: adminGuestsFiltersCopy.statusLabel }),
    );
    await userEvent.click(
      await screen.findByRole('option', { name: adminGuestsFiltersCopy.statusConfirmed }),
    );

    expect(onStatusChange).toHaveBeenCalledWith('confirmed');
  });
});
