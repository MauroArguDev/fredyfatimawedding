import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { FloralOrnament } from '@/components/ui/FloralOrnament';

describe('FloralOrnament', () => {
  it('rendersAsADecorativeImageHiddenFromAssistiveTech', () => {
    const { container } = render(<FloralOrnament src="/assets/flor.webp" />);

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });

  it('lazyLoadsByDefault', () => {
    const { container } = render(<FloralOrnament src="/assets/flor.webp" />);

    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
  });

  it('loadsEagerlyWhenMarkedAsPriority', () => {
    const { container } = render(<FloralOrnament src="/assets/flor.webp" isPriority />);

    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
  });
});
