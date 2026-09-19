import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DressCodeSection } from '@/components/ui/DressCodeSection';
import { dressCodeCopy } from '@/content/dressCode';

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

  it('rendersTheExtractedAvoidColorsImagePerGenderWithColorNamesInTheAltText', () => {
    render(<DressCodeSection />);

    const womenImage = screen.getByRole('img', { name: dressCodeCopy.women.avoidColorsImageAlt });
    expect(womenImage).toHaveAttribute('src', '/assets/dress-code/avoid-colors-women.webp');

    const menImage = screen.getByRole('img', { name: dressCodeCopy.men.avoidColorsImageAlt });
    expect(menImage).toHaveAttribute('src', '/assets/dress-code/avoid-colors-men.webp');
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
