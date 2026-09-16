import type { ReactNode } from 'react';
import { envelopeCopy } from '@/content/envelope';

const PAPER_ASSET = '/assets/envelope/paper.webp';
const SEAL_ASSET = '/assets/envelope/seal.webp';

interface EnvelopeGateProps {
  titleLabel: string;
  onOpen: () => void;
}

export const EnvelopeGate = ({ titleLabel, onOpen }: EnvelopeGateProps): ReactNode => {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={envelopeCopy.openButtonLabel(titleLabel)}
      className="fixed inset-0 z-50 flex h-dvh w-full items-end justify-center overflow-hidden bg-envelope-text focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-accent-coral"
    >
      <span className="absolute inset-0 flex" aria-hidden="true">
        <span
          className="h-full w-1/2 bg-cover bg-left"
          style={{ backgroundImage: `url(${PAPER_ASSET})` }}
        />
        <span
          className="h-full w-1/2 bg-cover bg-right"
          style={{ backgroundImage: `url(${PAPER_ASSET})` }}
        />
      </span>
      <img
        src={SEAL_ASSET}
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 w-2/5 max-w-[220px] -translate-x-1/2 -translate-y-1/2"
      />
      <span
        aria-hidden="true"
        className="relative mb-16 flex flex-col items-end gap-2 pr-8 font-script text-envelope-text"
      >
        <span className="text-4xl">{envelopeCopy.paraLabel}</span>
        <span className="text-3xl">{titleLabel}</span>
      </span>
    </button>
  );
};
