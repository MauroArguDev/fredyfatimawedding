import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { LocationIcon } from '@/components/ui/LocationIcon';

describe('LocationIcon', () => {
  it('isDecorativeSoTheAccessibleNameComesFromTheSurroundingLink', () => {
    const { container } = render(<LocationIcon brand="waze" />);

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });

  it('rendersTheWazeGlyphForTheWazeBrand', () => {
    const { container } = render(<LocationIcon brand="waze" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/icons/waze.svg');
  });

  it('rendersTheGoogleMapsGlyphForTheGoogleMapsBrand', () => {
    const { container } = render(<LocationIcon brand="google-maps" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/icons/google-maps.svg');
  });
});
