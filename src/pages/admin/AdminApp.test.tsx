import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminApp from '@/pages/admin/AdminApp';
import { adminShellCopy } from '@/content/appShell';

describe('AdminApp', () => {
  it('rendersThePlaceholderCopy', () => {
    render(<AdminApp />);

    expect(screen.getByText(adminShellCopy.placeholder)).toBeInTheDocument();
  });
});
