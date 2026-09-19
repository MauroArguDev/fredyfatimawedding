import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DressCodeSection } from '@/components/ui/DressCodeSection';
import { dressCodeCopy } from '@/content/dressCode';

const HEX_RADIX = 16;
const RED_START = 1;
const GREEN_START = 3;
const BLUE_START = 5;
const BLUE_END = 7;

const hexToRgb = (hex: string): string => {
  const r = Number.parseInt(hex.slice(RED_START, GREEN_START), HEX_RADIX);
  const g = Number.parseInt(hex.slice(GREEN_START, BLUE_START), HEX_RADIX);
  const b = Number.parseInt(hex.slice(BLUE_START, BLUE_END), HEX_RADIX);
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
};

describe('DressCodeSection', () => {
  it('rendersTheTitleAndCoupleIllustrationWithAccessibleNames', () => {
    render(<DressCodeSection />);

    expect(screen.getByRole('img', { name: dressCodeCopy.titleAlt })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: dressCodeCopy.coupleIllustrationAlt }),
    ).toBeInTheDocument();
  });

  it('rendersDistinctAvoidNotesPerGenderInsteadOfRepeatingTheFigmaCopyPasteBug', () => {
    render(<DressCodeSection />);

    expect(screen.getByText(dressCodeCopy.women.avoidNote)).toBeInTheDocument();
    expect(screen.getByText(dressCodeCopy.men.avoidNote)).toBeInTheDocument();
    expect(dressCodeCopy.women.avoidNote).not.toBe(dressCodeCopy.men.avoidNote);
  });

  it('rendersFiveColorSwatchesPerGenderColoredAndNamedInText', () => {
    render(<DressCodeSection />);

    for (const color of [...dressCodeCopy.women.colors, ...dressCodeCopy.men.colors]) {
      const label = screen.getByText(color.name);
      const swatch = label.previousElementSibling;
      expect(swatch).toHaveAttribute('aria-hidden', 'true');
      expect(swatch).toHaveStyle({ backgroundColor: hexToRgb(color.hex) });
    }
  });

  it('rendersBothGenderHeadingsWithDecorativeFloralCorners', () => {
    render(<DressCodeSection />);

    expect(screen.getByText(dressCodeCopy.women.heading)).toBeInTheDocument();
    expect(screen.getByText(dressCodeCopy.men.heading)).toBeInTheDocument();
  });

  it('rendersTheFloralCornersAsDecorative', () => {
    const { container } = render(<DressCodeSection />);

    const corners = container.querySelectorAll('img[aria-hidden="true"]');
    expect(corners).toHaveLength(4);
    for (const corner of corners) {
      expect(corner).toHaveAttribute('alt', '');
    }
  });
});
