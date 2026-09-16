import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StyleguidePage from '@/pages/StyleguidePage';

describe('StyleguidePage', () => {
  it('rendersAHeading', () => {
    render(<StyleguidePage />);

    expect(screen.getByRole('heading', { name: 'Styleguide', level: 1 })).toBeInTheDocument();
  });

  it('rendersEveryColorTokenWithItsHexValue', () => {
    render(<StyleguidePage />);

    const heading = screen.getByText(/--color-bg-base/);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('#F6D5A9');
  });

  it('flagsTheTextOnSageOverSurfaceSagePairingAsFailingAa', () => {
    render(<StyleguidePage />);

    const row = screen.getByText('text-on-sage on surface-sage').closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent('Fails AA');
  });

  it('reportsThatTextBodyOnBgBasePassesAa', () => {
    render(<StyleguidePage />);

    const row = screen.getByText('text-body on bg-base').closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent('Passes AA');
  });
});
