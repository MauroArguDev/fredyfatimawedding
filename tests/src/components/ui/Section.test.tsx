import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Section } from '@/components/ui/Section';

function renderSection(children = <p>Contenido</p>) {
  return render(
    <LazyMotion features={domAnimation}>
      <Section id="date">{children}</Section>
    </LazyMotion>,
  );
}

class ManualIntersectionObserver implements IntersectionObserver {
  static callbacks: IntersectionObserverCallback[] = [];
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  constructor(callback: IntersectionObserverCallback) {
    ManualIntersectionObserver.callbacks.push(callback);
  }

  observe = (): void => undefined;

  unobserve = (): void => undefined;

  disconnect = (): void => undefined;

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('Section', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    ManualIntersectionObserver.callbacks = [];
  });

  it('rendersASemanticSectionWithTheGivenId', () => {
    renderSection();

    const section = screen.getByText('Contenido').closest('section');
    expect(section).toHaveAttribute('id', 'date');
  });

  it('fadesInToFullyVisibleOnceItHasIntersected', async () => {
    renderSection();

    const section = screen.getByText('Contenido').closest('section');
    await waitFor(() => {
      expect(section).toHaveStyle({ opacity: '1' });
    });
  });

  it('fadesInOnlyAfterTheSectionIntersectsTheViewport', async () => {
    vi.stubGlobal('IntersectionObserver', ManualIntersectionObserver);

    renderSection();

    const section = screen.getByText('Contenido').closest('section');
    expect(section).toHaveStyle({ opacity: '0' });

    act(() => {
      const entry = { isIntersecting: true } as IntersectionObserverEntry;
      ManualIntersectionObserver.callbacks[0]?.(
        [entry],
        new ManualIntersectionObserver(() => undefined),
      );
    });

    await waitFor(() => {
      expect(section).toHaveStyle({ opacity: '1' });
    });
  });
});
