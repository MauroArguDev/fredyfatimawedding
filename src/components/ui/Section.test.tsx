import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '@/components/ui/Section';

describe('Section', () => {
  it('rendersASemanticSectionWithTheGivenId', () => {
    render(
      <Section id="date">
        <p>Contenido</p>
      </Section>,
    );

    const section = screen.getByText('Contenido').closest('section');
    expect(section).toHaveAttribute('id', 'date');
  });
});
