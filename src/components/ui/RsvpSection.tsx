import type { ReactNode } from 'react';
import { remindersCopy } from '@/content/reminders';

const RECUERDA_TITLE_IMAGE = '/assets/reminders/recuerda-title.webp';
const RECUERDA_TITLE_WIDTH = 1000;
const RECUERDA_TITLE_HEIGHT = 701;
const NINO_DURMIENDO_IMAGE = '/assets/reminders/nino-durmiendo.webp';
const REGALO_SOBRE_IMAGE = '/assets/reminders/regalo-sobre.webp';
const ILLUSTRATION_WIDTH = 1770;
const ILLUSTRATION_HEIGHT = 751;

const ReminderParagraph = ({
  prefix,
  emphasis,
}: {
  prefix: string;
  emphasis: string;
}): ReactNode => (
  <p>
    {prefix}
    <strong>{emphasis}</strong>
  </p>
);

const ReminderIllustration = ({ src }: { src: string }): ReactNode => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    loading="lazy"
    width={ILLUSTRATION_WIDTH}
    height={ILLUSTRATION_HEIGHT}
    className="mt-4 w-full"
  />
);

export const RsvpSection = (): ReactNode => {
  return (
    <section id="rsvp" className="w-full px-6 py-10 text-center text-text-body">
      <img
        src={RECUERDA_TITLE_IMAGE}
        alt={remindersCopy.titleAlt}
        width={RECUERDA_TITLE_WIDTH}
        height={RECUERDA_TITLE_HEIGHT}
        className="mx-auto w-full max-w-xs"
      />
      <ReminderParagraph
        prefix={remindersCopy.adultsOnly.prefix}
        emphasis={remindersCopy.adultsOnly.emphasis}
      />
      <ReminderIllustration src={NINO_DURMIENDO_IMAGE} />
      <div className="mt-8">
        <ReminderParagraph
          prefix={remindersCopy.envelopeGift.prefix}
          emphasis={remindersCopy.envelopeGift.emphasis}
        />
      </div>
      <ReminderIllustration src={REGALO_SOBRE_IMAGE} />
    </section>
  );
};
