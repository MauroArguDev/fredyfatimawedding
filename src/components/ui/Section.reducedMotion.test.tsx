import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Section } from '@/components/ui/Section';

window.matchMedia = (query: string): MediaQueryList => ({
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false,
});

class NeverIntersectingObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  observe = (): void => undefined;

  unobserve = (): void => undefined;

  disconnect = (): void => undefined;

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('Section under prefers-reduced-motion', () => {
  it('rendersFullyVisibleWithoutAnyOffsetInsteadOfAnimatingSeparateFileBecauseFramerMotionReadsMatchMediaOnlyOncePerModule', async () => {
    vi.stubGlobal('IntersectionObserver', NeverIntersectingObserver);

    render(
      <LazyMotion features={domAnimation}>
        <Section id="date">
          <p>Contenido</p>
        </Section>
      </LazyMotion>,
    );

    const section = screen.getByText('Contenido').closest('section');
    await waitFor(() => {
      expect(section).toHaveStyle({ opacity: '1', transform: 'none' });
    });
  });
});
