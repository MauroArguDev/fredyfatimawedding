import { useEffect, type FormEventHandler, type ReactNode } from 'react';
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/admin/primitives/button';
import { FieldError } from '@/components/admin/primitives/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin/primitives/dialog';
import { GuestFormFields } from '@/components/admin/guests/GuestFormFields';
import { useUpdateGuestMutation } from '@/components/admin/guests/useUpdateGuestMutation';
import {
  editGuestFormSchema,
  toUpdateGuestInput,
  type EditGuestFormValues,
} from '@/components/admin/guests/guestFormSchema';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { notifyOnSuccess } from '@/components/admin/guests/closeAndNotify';
import { editGuestDialogCopy, adminGuestToastCopy } from '@/content/adminGuestForm';
import type { AdminGuest } from '@/schemas/guest';

interface EditGuestDialogProps {
  guest: AdminGuest | null;
  onClose: () => void;
}

function toFormValues(guest: AdminGuest): EditGuestFormValues {
  return {
    firstName: guest.firstName,
    lastName: guest.lastName ?? '',
    titleLabel: guest.titleLabel ?? '',
    guestLimit: guest.guestLimit,
    phone: guest.phone,
    notes: guest.notes ?? '',
    confirmedCount: guest.confirmedCount,
  };
}

interface EditGuestFormProps {
  register: UseFormRegister<EditGuestFormValues>;
  errors: FieldErrors<EditGuestFormValues>;
  isSubmitting: boolean;
  serverErrorMessage: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const EditGuestForm = ({
  register,
  errors,
  isSubmitting,
  serverErrorMessage,
  onSubmit,
}: EditGuestFormProps): ReactNode => (
  <form onSubmit={onSubmit} className="flex flex-col gap-3">
    <GuestFormFields register={register} errors={errors} showConfirmedCount />
    {serverErrorMessage !== null && <FieldError>{serverErrorMessage}</FieldError>}
    <DialogFooter>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? editGuestDialogCopy.submitting : editGuestDialogCopy.submit}
      </Button>
    </DialogFooter>
  </form>
);

export const EditGuestDialog = ({ guest, onClose }: EditGuestDialogProps): ReactNode => {
  const mutation = useUpdateGuestMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditGuestFormValues>({ resolver: zodResolver(editGuestFormSchema) });

  useEffect(() => {
    if (guest !== null) {
      reset(toFormValues(guest));
    }
  }, [guest, reset]);

  const onSubmit = handleSubmit((values) => {
    if (guest === null) {
      return;
    }

    mutation.mutate(
      { id: guest.id, patch: toUpdateGuestInput(values) },
      { onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.updated) },
    );
  });

  return (
    <Dialog
      open={guest !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editGuestDialogCopy.title}</DialogTitle>
        </DialogHeader>
        <EditGuestForm
          register={register}
          errors={errors}
          isSubmitting={mutation.isPending}
          serverErrorMessage={resolveAdminApiErrorMessage(mutation.error)}
          onSubmit={(event) => {
            void onSubmit(event);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
