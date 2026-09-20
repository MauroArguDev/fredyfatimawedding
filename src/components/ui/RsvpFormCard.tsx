import { useState, type ReactNode } from 'react';
import { RsvpForm } from '@/components/ui/RsvpForm';
import { RsvpSuccessModal } from '@/components/ui/RsvpSuccessModal';
import {
  brideWhatsAppLink,
  formatGuestCountSummary,
  rsvpAlreadyConfirmedCopy,
  rsvpClosedCopy,
} from '@/content/rsvp';

const FRAME_IMAGE = '/assets/rsvp/marco-flor.webp';
const FRAME_IMAGE_WIDTH = 700;
const FRAME_IMAGE_HEIGHT = 409;

interface RsvpSubmission {
  count: number;
  waLink: string;
}

interface RsvpFormCardProps {
  token: string;
  guestLimit: number;
  confirmed: boolean;
  confirmedCount: number;
  rsvpOpen: boolean;
}

const RsvpAlreadyConfirmed = ({ confirmedCount }: { confirmedCount: number | null }): ReactNode => (
  <div className="flex flex-col items-center gap-3 text-center">
    <p className="font-bold text-text-body">{rsvpAlreadyConfirmedCopy.heading}</p>
    {confirmedCount !== null && (
      <p className="text-text-body">{formatGuestCountSummary(confirmedCount)}</p>
    )}
    <p className="text-text-body">{rsvpAlreadyConfirmedCopy.message}</p>
    <a
      href={brideWhatsAppLink}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-invitation-sm bg-surface-sage px-6 py-3 font-bold text-text-on-sage"
    >
      {rsvpAlreadyConfirmedCopy.contactLinkLabel}
    </a>
  </div>
);

const RsvpClosed = (): ReactNode => (
  <div className="flex flex-col items-center gap-3 text-center">
    <p className="font-bold text-text-body">{rsvpClosedCopy.heading}</p>
    <p className="text-text-body">{rsvpClosedCopy.message}</p>
  </div>
);

interface RsvpCardState {
  submission: RsvpSubmission | null;
  staleConfirmation: boolean;
  staleClosed: boolean;
}

interface RsvpCardHandlers {
  onAlreadyConfirmed: () => void;
  onClosed: () => void;
  onSuccess: (result: RsvpSubmission) => void;
}

function resolveRsvpCardContent(
  { token, guestLimit, confirmed, confirmedCount, rsvpOpen }: RsvpFormCardProps,
  { submission, staleConfirmation, staleClosed }: RsvpCardState,
  { onAlreadyConfirmed, onClosed, onSuccess }: RsvpCardHandlers,
): ReactNode {
  if (submission !== null) {
    return <RsvpAlreadyConfirmed confirmedCount={submission.count} />;
  }

  if (confirmed || staleConfirmation) {
    return <RsvpAlreadyConfirmed confirmedCount={confirmed ? confirmedCount : null} />;
  }

  if (!rsvpOpen || staleClosed) {
    return <RsvpClosed />;
  }

  return (
    <RsvpForm
      token={token}
      guestLimit={guestLimit}
      onAlreadyConfirmed={onAlreadyConfirmed}
      onClosed={onClosed}
      onSuccess={onSuccess}
    />
  );
}

export const RsvpFormCard = (props: RsvpFormCardProps): ReactNode => {
  const [submission, setSubmission] = useState<RsvpSubmission | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [staleConfirmation, setStaleConfirmation] = useState(false);
  const [staleClosed, setStaleClosed] = useState(false);

  const content = resolveRsvpCardContent(
    props,
    { submission, staleConfirmation, staleClosed },
    {
      onAlreadyConfirmed: () => {
        setStaleConfirmation(true);
      },
      onClosed: () => {
        setStaleClosed(true);
      },
      onSuccess: (result) => {
        setSubmission(result);
        setIsSuccessModalOpen(true);
      },
    },
  );

  return (
    <div className="relative mt-8 -mx-6 w-[calc(100%+3rem)]">
      <img
        src={FRAME_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={FRAME_IMAGE_WIDTH}
        height={FRAME_IMAGE_HEIGHT}
        className="w-full"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-10 py-8">
        {content}
      </div>
      {submission !== null && (
        <RsvpSuccessModal
          isOpen={isSuccessModalOpen}
          count={submission.count}
          waLink={submission.waLink}
          onClose={() => {
            setIsSuccessModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
