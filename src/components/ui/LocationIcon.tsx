import type { ReactNode } from 'react';

type LocationBrand = 'waze' | 'google-maps';

interface LocationIconProps {
  brand: LocationBrand;
  className?: string;
}

const ICON_SRC: Record<LocationBrand, string> = {
  waze: '/assets/icons/waze.svg',
  'google-maps': '/assets/icons/google-maps.svg',
};

export const LocationIcon = ({ brand, className }: LocationIconProps): ReactNode => {
  return <img src={ICON_SRC[brand]} alt="" aria-hidden="true" className={className} />;
};
