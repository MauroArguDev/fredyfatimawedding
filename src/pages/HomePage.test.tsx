import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/pages/HomePage';
import { homeCopy } from '@/content/appShell';

describe('HomePage', () => {
  it('showsTheInformationalCopyWhenThereIsNoToken', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: homeCopy.heading })).toBeInTheDocument();
    expect(screen.getByText(homeCopy.body)).toBeInTheDocument();
  });
});
