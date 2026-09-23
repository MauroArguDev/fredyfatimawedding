import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoverSection } from '@/components/ui/CoverSection';
import { coverCopy } from '@/content/cover';

describe('CoverSection', () => {
  it('rendersTheCoupleNamesAsTheOnlyHeadingWithoutTheGuestName', () => {
    render(<CoverSection />);

    expect(screen.getByRole('heading', { level: 1, name: coverCopy.names })).toBeInTheDocument();
  });

  it('declaresThePhotoDimensionsToAvoidLayoutShift', () => {
    const { container } = render(<CoverSection />);

    const photo = container.querySelector('img[alt=""]');
    expect(photo).toHaveAttribute('width');
    expect(photo).toHaveAttribute('height');
  });

  it('loadsThePhotoEagerlySoItPreloadsWhileTheEnvelopeIsStillOnScreen', () => {
    const { container } = render(<CoverSection />);

    const photo = container.querySelector('img[alt=""]');
    expect(photo).toHaveAttribute('loading', 'eager');
  });

  it('mirrorsTheSameFloralOrnamentOnBothSidesInsteadOfShippingTwoAssets', () => {
    const { container } = render(<CoverSection />);

    const ornaments = container.querySelectorAll('img[aria-hidden="true"]');
    expect(ornaments).toHaveLength(2);
    expect(ornaments[0]?.getAttribute('src')).toBe(ornaments[1]?.getAttribute('src'));
    expect(ornaments[1]).toHaveClass('-scale-x-100');
  });
});
