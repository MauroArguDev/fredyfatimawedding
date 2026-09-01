import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';

describe('AdminLoadingState', () => {
  it('rendersTheMessageWithAStatusRole', () => {
    render(<AdminLoadingState message="Cargando…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });
});
