import type { FormEventHandler, ReactNode } from 'react';
import type { FieldError, UseFormRegister } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RsvpConfirmModal } from '@/components/ui/RsvpConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { useRsvpFormSubmission } from '@/hooks/useRsvpFormSubmission';
import { MIN_GUEST_LIMIT } from '@/schemas/guest';
import { formatGuestCountOption, rsvpFormCopy, rsvpPickerCopy } from '@/content/rsvp';

const GUEST_COUNT_SELECT_ID = 'rsvp-guest-count';

interface RsvpFormValues {
  count: number;
}

interface RsvpFormProps {
  token: string;
  guestLimit: number;
  onAlreadyConfirmed: () => void;
  onClosed: () => void;
  onSuccess: (result: { count: number; waLink: string }) => void;
}

function buildCountOptions(guestLimit: number): number[] {
  const options: number[] = [];
  for (let count = MIN_GUEST_LIMIT; count <= guestLimit; count += 1) {
    options.push(count);
  }
  return options;
}

interface RsvpFormFieldsProps {
  guestLimit: number;
  register: UseFormRegister<RsvpFormValues>;
  countError: FieldError | undefined;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const RsvpFormFields = ({
  guestLimit,
  register,
  countError,
  onSubmit,
}: RsvpFormFieldsProps): ReactNode => (
  <form
    className="flex flex-col items-center gap-4 rounded-invitation-sm bg-surface-form px-6 py-6"
    onSubmit={onSubmit}
  >
    <div className="flex flex-col items-center gap-2">
      <label htmlFor={GUEST_COUNT_SELECT_ID} className="font-bold text-text-body">
        {rsvpPickerCopy.instruction}
      </label>
      <Select
        id={GUEST_COUNT_SELECT_ID}
        aria-invalid={countError !== undefined}
        aria-describedby={countError !== undefined ? 'rsvp-count-error' : undefined}
        defaultValue=""
        {...register('count')}
      >
        <option value="" disabled>
          {rsvpPickerCopy.placeholder}
        </option>
        {buildCountOptions(guestLimit).map((count) => (
          <option key={count} value={count}>
            {formatGuestCountOption(count)}
          </option>
        ))}
      </Select>
      {countError !== undefined && (
        <p id="rsvp-count-error" role="alert" className="text-sm text-accent-terracotta">
          {countError.message}
        </p>
      )}
    </div>
    <Button type="submit" variant="dark" className="shadow-[0_10px_14px_0_rgba(0,0,0,0.3)]">
      {rsvpFormCopy.submitLabel}
    </Button>
  </form>
);

export const RsvpForm = ({
  token,
  guestLimit,
  onAlreadyConfirmed,
  onClosed,
  onSuccess,
}: RsvpFormProps): ReactNode => {
  const form = useRsvpFormSubmission({
    token,
    guestLimit,
    onAlreadyConfirmed,
    onClosed,
    onSuccess,
  });

  return (
    <>
      <RsvpFormFields
        guestLimit={guestLimit}
        register={form.register}
        countError={form.countError}
        onSubmit={form.onSubmit}
      />
      <RsvpConfirmModal
        isOpen={form.pendingCount !== null}
        count={form.pendingCount ?? MIN_GUEST_LIMIT}
        isSubmitting={form.isSubmitting}
        onClose={form.onCancelConfirm}
        onConfirm={form.onConfirm}
      />
      {form.submitError !== null && (
        <Toast message={form.submitError} onDismiss={form.dismissSubmitError} />
      )}
    </>
  );
};
