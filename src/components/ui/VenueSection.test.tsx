import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VenueSection } from '@/components/ui/VenueSection';
import { venueCopy } from '@/content/venue';

describe('VenueSection', () => {
  it('rendersTheTitleAndHotelPhotoWithAccessibleNames', () => {
    render(<VenueSection />);

    expect(screen.getByRole('img', { name: venueCopy.titleAlt })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: venueCopy.hotelPhotoAlt })).toBeInTheDocument();
  });

  it('rendersTheFullAddress', () => {
    render(<VenueSection />);

    expect(screen.getByText(venueCopy.address)).toBeInTheDocument();
  });

  it('rendersBothLocationButtonsAsRealLinksThatOpenInANewTabSafely', () => {
    render(<VenueSection />);

    const waze = screen.getByRole('link', { name: venueCopy.wazeAriaLabel });
    expect(waze).toHaveAttribute('href', venueCopy.wazeUrl);
    expect(waze).toHaveAttribute('target', '_blank');
    expect(waze).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(waze).toHaveAttribute('rel', expect.stringContaining('noreferrer'));

    const googleMaps = screen.getByRole('link', { name: venueCopy.googleMapsAriaLabel });
    expect(googleMaps).toHaveAttribute('href', venueCopy.googleMapsUrl);
    expect(googleMaps).toHaveAttribute('target', '_blank');
    expect(googleMaps).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(googleMaps).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('rendersTheLocationIconsAsDecorativeSoTheLinkAriaLabelIsTheOnlyAccessibleName', () => {
    const { container } = render(<VenueSection />);

    const decorativeImages = container.querySelectorAll('img[aria-hidden="true"]');
    expect(decorativeImages).toHaveLength(2);
    for (const image of decorativeImages) {
      expect(image).toHaveAttribute('alt', '');
    }
  });
});
