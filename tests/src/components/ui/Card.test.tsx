import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('rendersItsChildren', () => {
    render(<Card variant="dark">Contenido</Card>);

    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('appliesTheSurfaceClassesForTheGivenVariant', () => {
    render(<Card variant="sage">Contenido</Card>);

    expect(screen.getByText('Contenido')).toHaveClass('bg-surface-sage', 'text-text-on-sage');
  });
});
