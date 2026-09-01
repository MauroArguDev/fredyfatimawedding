import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/admin/primitives/button';
import { FieldError } from '@/components/admin/primitives/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/admin/primitives/dialog';
import { GuestFormFields } from '@/components/admin/guests/GuestFormFields';
import { useCreateGuestMutation } from '@/components/admin/guests/useCreateGuestMutation';
import {
  editGuestFormSchema,
  toCreateGuestInput,
  type EditGuestFormValues,
} from '@/components/admin/guests/guestFormSchema';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { toast } from 'sonner';
import { createGuestDialogCopy, adminGuestToastCopy } from '@/content/adminGuestForm';

const EMPTY_VALUES: EditGuestFormValues = {
  firstName: '',
  lastName: '',
  titleLabel: '',
  guestLimit: 1,
  phone: '',
  notes: '',
  confirmedCount: 0,
};

export const CreateGuestDialog = (): ReactNode => {
  const [open, setOpen] = useState(false);
  const mutation = useCreateGuestMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditGuestFormValues>({
    resolver: zodResolver(editGuestFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(toCreateGuestInput(values), {
      onSuccess: () => {
        reset(EMPTY_VALUES);
        setOpen(false);
        toast.success(adminGuestToastCopy.created);
      },
    });
  });

  const serverErrorMessage = resolveAdminApiErrorMessage(mutation.error);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">{createGuestDialogCopy.trigger}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{createGuestDialogCopy.title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          className="flex flex-col gap-3"
        >
          <GuestFormFields register={register} errors={errors} />
          {serverErrorMessage !== null && <FieldError>{serverErrorMessage}</FieldError>}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? createGuestDialogCopy.submitting : createGuestDialogCopy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
