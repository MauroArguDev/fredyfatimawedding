import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/App';
import { homeCopy, notFoundCopy, adminShellCopy } from '@/content/appShell';

function setPath(path: string) {
  window.history.pushState({}, '', path);
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: 'TOKEN_NOT_FOUND' }), { status: 404 }),
        ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setPath('/');
  });

  it('rendersTheHomePageAtTheRoot', () => {
    setPath('/');

    render(<App />);

    expect(screen.getByText(homeCopy.heading)).toBeInTheDocument();
  });

  it('rendersTheNotFoundPageForAnUnknownRoute', () => {
    setPath('/this-route-does-not-exist');

    render(<App />);

    expect(screen.getByText(notFoundCopy.heading)).toBeInTheDocument();
  });

  it('showsTheAdminLoadingFallbackBeforeTheLazyChunkResolves', () => {
    setPath('/admin');

    render(<App />);

    expect(screen.getByText(adminShellCopy.loading)).toBeInTheDocument();
  });
});
