import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminGuestsStats } from '@/components/admin/guests/AdminGuestsStats';
import { adminGuestsStatsCopy } from '@/content/adminGuests';

describe('AdminGuestsStats', () => {
  it('rendersEveryStatWithItsValue', () => {
    render(
      <AdminGuestsStats
        stats={{
          total: 10,
          confirmed: 4,
          pending: 6,
          openedNotConfirmed: 2,
          totalConfirmedPeople: 9,
        }}
      />,
    );

    expect(screen.getByText(adminGuestsStatsCopy.total).nextElementSibling).toHaveTextContent('10');
    expect(screen.getByText(adminGuestsStatsCopy.confirmed).nextElementSibling).toHaveTextContent(
      '4',
    );
    expect(
      screen.getByText(adminGuestsStatsCopy.openedNotConfirmed).nextElementSibling,
    ).toHaveTextContent('2');
    expect(
      screen.getByText(adminGuestsStatsCopy.totalConfirmedPeople).nextElementSibling,
    ).toHaveTextContent('9');
  });
});
