import type { ReactNode } from 'react';
import { m, type MotionStyle } from 'framer-motion';
import { envelopeCopy } from '@/content/envelope';
import { useEnvelopeOpenAnimation } from '@/hooks/useEnvelopeOpenAnimation';

const PAPER_ASSET = '/assets/envelope/paper.webp';
const SEAL_ASSET = '/assets/envelope/seal.webp';
const FLAP_BACKGROUND_STYLE: MotionStyle = { backgroundImage: `url(${PAPER_ASSET})` };

interface EnvelopeGateProps {
  titleLabel: string;
  onOpen: () => void;
  onTap: () => void;
}

const EnvelopeAddressee = ({ titleLabel }: { titleLabel: string }): ReactNode => (
  <span
    aria-hidden="true"
    className="absolute right-8 bottom-16 flex flex-col items-end gap-2 font-script text-envelope-text"
  >
    <span className="text-[44px]">{envelopeCopy.paraLabel}</span>
    <span className="text-[32px]">{titleLabel}</span>
  </span>
);

type EnvelopeAnimation = ReturnType<typeof useEnvelopeOpenAnimation>;

const EnvelopeFlaps = ({ animation }: { animation: EnvelopeAnimation }): ReactNode => (
  <span aria-hidden="true" className="absolute inset-0 flex [perspective:1400px]">
    <m.span
      className="h-full w-1/2 origin-left bg-cover bg-left [backface-visibility:hidden]"
      style={FLAP_BACKGROUND_STYLE}
      animate={animation.leftFlapAnimate}
      transition={animation.flapTransition}
    />
    <m.span
      className="h-full w-1/2 origin-right bg-cover bg-right [backface-visibility:hidden]"
      style={FLAP_BACKGROUND_STYLE}
      animate={animation.rightFlapAnimate}
      transition={animation.flapTransition}
    />
  </span>
);

export const EnvelopeGate = ({ titleLabel, onOpen, onTap }: EnvelopeGateProps): ReactNode => {
  const animation = useEnvelopeOpenAnimation(onOpen);

  const handleClick = (): void => {
    if (!animation.isOpening) {
      onTap();
    }
    animation.handleClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={animation.isOpening}
      aria-busy={animation.isOpening}
      aria-label={envelopeCopy.openButtonLabel(titleLabel)}
      className="fixed inset-0 z-50 flex h-dvh w-full justify-center overflow-hidden bg-envelope-text focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-accent-coral disabled:cursor-default"
    >
      <m.span
        className="relative h-full w-full max-w-invitation"
        animate={animation.envelopeAnimate}
        transition={animation.envelopeTransition}
      >
        <EnvelopeFlaps animation={animation} />
        <span className="absolute top-1/2 left-1/2 w-2/5 max-w-[220px] -translate-x-1/2 -translate-y-1/2">
          <m.img
            src={SEAL_ASSET}
            alt=""
            aria-hidden="true"
            className="w-full"
            animate={animation.sealAnimate}
            transition={animation.sealTransition}
          />
        </span>
        <EnvelopeAddressee titleLabel={titleLabel} />
      </m.span>
    </button>
  );
};
