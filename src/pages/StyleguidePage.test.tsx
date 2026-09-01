import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StyleguidePage from '@/pages/StyleguidePage';

describe('StyleguidePage', () => {
  it('rendersAPlaceholderHeading', () => {
    render(<StyleguidePage />);

    expect(screen.getByRole('heading', { name: 'Styleguide' })).toBeInTheDocument();
  });
});
