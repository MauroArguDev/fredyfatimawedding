import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { useInvitation, InvitationNotFoundError } from '@/hooks/useInvitation';
import { InvitationProvider } from '@/hooks/InvitationProvider';
import { toInvitationContextValue } from '@/hooks/invitationContext';
import { useInvitationContext } from '@/hooks/useInvitationContext';
import { PublicPageContainer } from '@/components/ui/PublicPageContainer';
import { EnvelopeGate } from '@/components/ui/EnvelopeGate';
import { CoverSection } from '@/components/ui/CoverSection';
import { DateSection } from '@/components/ui/DateSection';
import { AboutUsSection } from '@/components/ui/AboutUsSection';
import { VenueSection } from '@/components/ui/VenueSection';
import { TimelineSection } from '@/components/ui/TimelineSection';
import { DressCodeSection } from '@/components/ui/DressCodeSection';
import { RsvpSection } from '@/components/ui/RsvpSection';
import { invitationStatusCopy } from '@/content/appShell';
import NotFoundPage from '@/pages/NotFoundPage';

interface InvitationStatusScreenProps {
  message: string;
  heading?: string;
  onRetry?: () => void;
}

const InvitationStatusScreen = ({
  message,
  heading,
  onRetry,
}: InvitationStatusScreenProps): ReactNode => {
  return (
    <PublicPageContainer>
      {heading !== undefined && (
        <h1 className="text-xl font-semibold text-text-heading">{heading}</h1>
      )}
      <p>{message}</p>
      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded bg-surface-sage px-4 py-2 text-text-on-sage"
        >
          {invitationStatusCopy.retry}
        </button>
      )}
    </PublicPageContainer>
  );
};

const useEnvelopeGate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    content.inert = !isOpen;
    if (isOpen) {
      content.focus();
    }
  }, [isOpen]);

  const handleOpen = (): void => {
    setIsOpen(true);
  };

  return { isOpen, contentRef, handleOpen };
};

const CONTENT_ENTRANCE_DURATION_S = 0.7;
const CONTENT_ENTRANCE_OFFSET_PX = 20;
const CONTENT_ENTRANCE_SCALE_FROM = 0.985;

interface InvitationContentProps {
  token: string;
}

const InvitationContent = ({ token }: InvitationContentProps): ReactNode => {
  const invitation = useInvitationContext();
  const { isOpen, contentRef, handleOpen } = useEnvelopeGate();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const entranceOffset = shouldReduceMotion ? 0 : CONTENT_ENTRANCE_OFFSET_PX;
  const entranceScale = shouldReduceMotion ? 1 : CONTENT_ENTRANCE_SCALE_FROM;
  const contentVariants = {
    hidden: { y: entranceOffset, scale: entranceScale },
    visible: { y: 0, scale: 1 },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      {!isOpen && <EnvelopeGate titleLabel={invitation.displayName} onOpen={handleOpen} />}
      <m.main
        ref={contentRef}
        tabIndex={-1}
        className="mx-auto min-h-dvh w-full max-w-invitation bg-bg-base text-text-body"
        variants={contentVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        transition={{ duration: CONTENT_ENTRANCE_DURATION_S, ease: 'easeOut' }}
      >
        <CoverSection />
        <DateSection />
        <AboutUsSection />
        <VenueSection />
        <TimelineSection />
        <DressCodeSection />
        <RsvpSection token={token} />
      </m.main>
    </LazyMotion>
  );
};

const InvitationPage = (): ReactNode => {
  const { token } = useParams<{ token: string }>();
  const query = useInvitation(token ?? '');

  if (query.isPending) {
    return <InvitationStatusScreen message={invitationStatusCopy.loading} />;
  }

  if (query.isError) {
    if (query.error instanceof InvitationNotFoundError) {
      return <NotFoundPage />;
    }

    return (
      <InvitationStatusScreen
        heading={invitationStatusCopy.networkErrorHeading}
        message={invitationStatusCopy.networkErrorBody}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  return (
    <InvitationProvider value={toInvitationContextValue(query.data)}>
      <InvitationContent token={token ?? ''} />
    </InvitationProvider>
  );
};

export default InvitationPage;
