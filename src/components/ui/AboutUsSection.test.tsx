import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutUsSection } from '@/components/ui/AboutUsSection';
import { aboutUsCopy } from '@/content/aboutUs';

describe('AboutUsSection', () => {
  it('rendersTheCollageImageWithAnInformativeAltAndDimensionsToAvoidLayoutShift', () => {
    render(<AboutUsSection />);

    const image = screen.getByRole('img', { name: aboutUsCopy.collageAlt });
    expect(image).toHaveAttribute('src', '/assets/about-us/collage.webp');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('rendersTheEmphasizedPhraseAndTheVowInScriptFontWithinTheTerracottaQuote', () => {
    const { container } = render(<AboutUsSection />);

    const quote = [...container.querySelectorAll('p')].find((p) =>
      p.textContent.startsWith(aboutUsCopy.quote.before),
    );
    expect(quote).toHaveClass('text-accent-terracotta');

    const scriptSpans = container.querySelectorAll('.font-script');
    expect(scriptSpans).toHaveLength(2);
    expect(scriptSpans[0]).toHaveTextContent(aboutUsCopy.quote.emphasis);
    expect(scriptSpans[1]).toHaveTextContent(aboutUsCopy.quote.vow);
  });

  it('rendersTheTwoHorizontalDividerLinesAroundTheQuote', () => {
    const { container } = render(<AboutUsSection />);

    expect(container.querySelectorAll('.bg-accent-terracotta\\/50')).toHaveLength(2);
  });
});
