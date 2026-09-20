import type { FormEventHandler, ReactNode } from 'react';
import type { FieldError, UseFormRegister } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RsvpConfirmModal } from '@/components/ui/RsvpConfirmModal';
import { useRsvpFormSubmission } from '@/hooks/useRsvpFormSubmission';
import { MIN_GUEST_LIMIT } from '@/schemas/guest';
import { formatGuestCountOption, rsvpFormCopy, rsvpPickerCopy } from '@/content/rsvp';

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
  submitError: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const RsvpFormFields = ({
  guestLimit,
  register,
  countError,
  submitError,
  onSubmit,
}: RsvpFormFieldsProps): ReactNode => (
  <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
    <div>
      <Select
        aria-label={rsvpPickerCopy.label}
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
        <p id="rsvp-count-error" role="alert" className="mt-2 text-sm text-accent-terracotta">
          {countError.message}
        </p>
      )}
    </div>
    <Button type="submit">{rsvpFormCopy.submitLabel}</Button>
    {submitError !== null && (
      <p role="alert" className="text-sm text-accent-terracotta">
        {submitError}
      </p>
    )}
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
        submitError={form.submitError}
        onSubmit={form.onSubmit}
      />
      <RsvpConfirmModal
        isOpen={form.pendingCount !== null}
        count={form.pendingCount ?? MIN_GUEST_LIMIT}
        isSubmitting={form.isSubmitting}
        onClose={form.onCancelConfirm}
        onConfirm={form.onConfirm}
      />
    </>
  );
};
