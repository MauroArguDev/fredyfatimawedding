import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFoundPage from '@/pages/NotFoundPage';
import { notFoundCopy } from '@/content/appShell';

describe('NotFoundPage', () => {
  it('showsTheNotFoundCopy', () => {
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { name: notFoundCopy.heading })).toBeInTheDocument();
    expect(screen.getByText(notFoundCopy.body)).toBeInTheDocument();
  });
});
