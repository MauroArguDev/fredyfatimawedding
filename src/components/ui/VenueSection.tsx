import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { LocationIcon } from '@/components/ui/LocationIcon';
import { venueCopy } from '@/content/venue';

const TITLE_IMAGE = '/assets/venue/title.webp';
const TITLE_WIDTH = 1690;
const TITLE_HEIGHT = 476;
const HOTEL_IMAGE = '/assets/venue/hotel.webp';
const HOTEL_WIDTH = 1600;
const HOTEL_HEIGHT = 1056;

const LocationButton = ({
  brand,
  href,
  ariaLabel,
}: {
  brand: 'waze' | 'google-maps';
  href: string;
  ariaLabel: string;
}): ReactNode => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="inline-flex items-center gap-2 rounded-full bg-bg-hero py-1 pr-4 pl-1 shadow-invitation-badge"
  >
    <LocationIcon brand={brand} className="size-9 rounded-full bg-bg-hero p-1.5" />
    <span aria-hidden="true" className="text-sm font-medium text-text-body">
      {venueCopy.locationLabel}
    </span>
  </a>
);

export const VenueSection = (): ReactNode => {
  return (
    <Section id="venue" className="text-center text-text-body">
      <img src={TITLE_IMAGE} alt={venueCopy.titleAlt} width={TITLE_WIDTH} height={TITLE_HEIGHT} />
      <img
        src={HOTEL_IMAGE}
        alt={venueCopy.hotelPhotoAlt}
        loading="lazy"
        width={HOTEL_WIDTH}
        height={HOTEL_HEIGHT}
        className="mt-6 w-full rounded-invitation-sm"
      />
      <p className="mx-auto mt-6 inline-block rounded-full border border-envelope-text/40 px-4 py-1">
        {venueCopy.hotelBadge}
      </p>
      <p className="mt-4">{venueCopy.address}</p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <LocationButton brand="waze" href={venueCopy.wazeUrl} ariaLabel={venueCopy.wazeAriaLabel} />
        <LocationButton
          brand="google-maps"
          href={venueCopy.googleMapsUrl}
          ariaLabel={venueCopy.googleMapsAriaLabel}
        />
      </div>
    </Section>
  );
};
