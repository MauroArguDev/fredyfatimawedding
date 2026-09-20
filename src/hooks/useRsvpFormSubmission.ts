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

interface HandleRsvpErrorDeps {
  onAlreadyConfirmed: () => void;
  onClosed: () => void;
  setSubmitError: (message: string) => void;
  clearPendingCount: () => void;
}

function handleRsvpError(error: unknown, deps: HandleRsvpErrorDeps): void {
  deps.clearPendingCount();
  const code = resolveRsvpErrorCode(error);

  if (code === 'ALREADY_CONFIRMED') {
    deps.onAlreadyConfirmed();
  } else if (code === 'RSVP_CLOSED') {
    deps.onClosed();
  } else {
    deps.setSubmitError(rsvpErrorMessages[code]);
  }
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
        onError: (error) => {
          handleRsvpError(error, {
            onAlreadyConfirmed,
            onClosed,
            setSubmitError,
            clearPendingCount: () => {
              setPendingCount(null);
            },
          });
        },
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
    dismissError: () => {
      setSubmitError(null);
    },
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
    dismissSubmitError: submission.dismissError,
  };
}
