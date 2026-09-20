import { useState, type FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitRsvp, RsvpApiError } from '@/hooks/useSubmitRsvp';
import { MIN_GUEST_LIMIT, type RsvpErrorCode } from '@/schemas/guest';
import { rsvpErrorMessages, rsvpFormCopy } from '@/content/rsvp';

interface RsvpFormValues {
  count: number;
}

interface UseRsvpFormSubmissionParams {
  token: string;
  guestLimit: number;
  onAlreadyConfirmed: () => void;
  onClosed: () => void;
  onSuccess: (result: { count: number; waLink: string }) => void;
}

function resolveRsvpErrorCode(error: unknown): RsvpErrorCode | 'NETWORK_ERROR' {
  return error instanceof RsvpApiError ? error.code : 'NETWORK_ERROR';
}

function useRsvpCountForm(guestLimit: number) {
  const countSchema = z.object({
    count: z.coerce
      .number({ message: rsvpFormCopy.countRequiredError })
      .int()
      .min(MIN_GUEST_LIMIT, rsvpFormCopy.countRequiredError)
      .max(guestLimit, rsvpFormCopy.countRequiredError),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpFormValues>({ resolver: zodResolver(countSchema) });

  return { register, countError: errors.count, handleSubmit };
}

function useRsvpSubmissionState({
  token,
  onAlreadyConfirmed,
  onClosed,
  onSuccess,
}: Omit<UseRsvpFormSubmissionParams, 'guestLimit'>) {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useSubmitRsvp();

  const handleRsvpError = (error: unknown): void => {
    setPendingCount(null);
    const code = resolveRsvpErrorCode(error);

    if (code === 'ALREADY_CONFIRMED') {
      onAlreadyConfirmed();
    } else if (code === 'RSVP_CLOSED') {
      onClosed();
    } else {
      setSubmitError(rsvpErrorMessages[code]);
    }
  };

  const handleConfirm = (): void => {
    if (pendingCount === null) {
      return;
    }

    mutation.mutate(
      { token, count: pendingCount },
      {
        onSuccess: (response) => {
          onSuccess({ count: pendingCount, waLink: response.waLink });
        },
        onError: handleRsvpError,
      },
    );
  };

  return {
    pendingCount,
    submitError,
    isSubmitting: mutation.isPending,
    beginConfirmation: (count: number) => {
      setSubmitError(null);
      setPendingCount(count);
    },
    cancelConfirmation: () => {
      setPendingCount(null);
    },
    confirm: handleConfirm,
  };
}

export function useRsvpFormSubmission({
  token,
  guestLimit,
  onAlreadyConfirmed,
  onClosed,
  onSuccess,
}: UseRsvpFormSubmissionParams) {
  const { register, countError, handleSubmit } = useRsvpCountForm(guestLimit);
  const submission = useRsvpSubmissionState({ token, onAlreadyConfirmed, onClosed, onSuccess });

  const openConfirmModal = handleSubmit((values) => {
    submission.beginConfirmation(values.count);
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    void openConfirmModal(event);
  };

  return {
    register,
    countError,
    submitError: submission.submitError,
    pendingCount: submission.pendingCount,
    isSubmitting: submission.isSubmitting,
    onSubmit,
    onConfirm: submission.confirm,
    onCancelConfirm: submission.cancelConfirmation,
  };
}
