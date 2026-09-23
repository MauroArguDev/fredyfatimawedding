import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/Select';

describe('Select', () => {
  it('rendersANativeSelectWithItsOptions', () => {
    render(
      <Select aria-label="Cantidad">
        <option value="1">1 persona.</option>
        <option value="2">2 personas.</option>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Cantidad' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2 personas.' })).toBeInTheDocument();
  });

  it('isOperableWithTheKeyboard', async () => {
    const user = userEvent.setup();
    render(
      <Select aria-label="Cantidad" defaultValue="1">
        <option value="1">1 persona.</option>
        <option value="2">2 personas.</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'Cantidad' });
    await user.tab();
    expect(select).toHaveFocus();

    await user.selectOptions(select, '2');
    expect(select).toHaveValue('2');
  });
});
