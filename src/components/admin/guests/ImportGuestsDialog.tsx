import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/admin/primitives/button';
import { Input } from '@/components/admin/primitives/input';
import { Field, FieldLabel } from '@/components/admin/primitives/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/admin/primitives/dialog';
import { PendingButtonLabel } from '@/components/admin/PendingButtonLabel';
import {
  useImportGuestsMutation,
  type ImportGuestsResult,
} from '@/components/admin/guests/useImportGuestsMutation';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import {
  GuestImportValidationError,
  type GuestImportRowError,
} from '@/components/admin/guests/adminGuestsApiError';
import {
  adminGuestsImportCopy,
  buildGuestImportRowErrorLabel,
  buildGuestImportSuccessMessage,
} from '@/content/adminGuests';

interface RowErrorsListProps {
  errors: GuestImportRowError[];
}

const RowErrorsList = ({ errors }: RowErrorsListProps): ReactNode => (
  <div className="flex flex-col gap-1">
    <p className="text-sm font-medium text-destructive">{adminGuestsImportCopy.rowErrorsHeading}</p>
    <ul className="flex flex-col gap-1 text-sm text-destructive">
      {errors.map((error) => (
        <li key={error.row}>{buildGuestImportRowErrorLabel(error.row, error.message)}</li>
      ))}
    </ul>
  </div>
);

interface ImportGuestsFormProps {
  rowErrors: GuestImportRowError[] | null;
  isPending: boolean;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

const ImportGuestsForm = ({
  rowErrors,
  isPending,
  onFileChange,
  onSubmit,
  isSubmitDisabled,
}: ImportGuestsFormProps): ReactNode => (
  <div className="flex flex-col gap-3">
    <Field>
      <FieldLabel htmlFor="guest-import-file">{adminGuestsImportCopy.fileLabel}</FieldLabel>
      <Input
        id="guest-import-file"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          onFileChange(event.target.files?.[0] ?? null);
        }}
      />
    </Field>
    {rowErrors !== null && <RowErrorsList errors={rowErrors} />}
    <DialogFooter>
      <Button type="button" disabled={isSubmitDisabled} onClick={onSubmit}>
        <PendingButtonLabel
          isPending={isPending}
          pendingLabel={adminGuestsImportCopy.submitting}
          label={adminGuestsImportCopy.submit}
        />
      </Button>
    </DialogFooter>
  </div>
);

function buildImportMutationHandlers(
  closeAndReset: () => void,
  setRowErrors: (errors: GuestImportRowError[]) => void,
): {
  onSuccess: (result: ImportGuestsResult) => void;
  onError: (error: unknown) => void;
} {
  return {
    onSuccess: (result) => {
      toast.success(buildGuestImportSuccessMessage(result.imported, result.skipped));
      closeAndReset();
    },
    onError: (error) => {
      if (error instanceof GuestImportValidationError) {
        setRowErrors(error.errors);
        return;
      }

      toast.error(resolveAdminApiErrorMessage(error) ?? adminGuestsImportCopy.genericError);
    },
  };
}

function buildOpenChangeHandler(
  setOpen: (value: boolean) => void,
  closeAndReset: () => void,
): (next: boolean) => void {
  return (next) => {
    if (next) {
      setOpen(true);
    } else {
      closeAndReset();
    }
  };
}

export const ImportGuestsDialog = (): ReactNode => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rowErrors, setRowErrors] = useState<GuestImportRowError[] | null>(null);
  const mutation = useImportGuestsMutation();

  const closeAndReset = (): void => {
    setOpen(false);
    setFile(null);
    setRowErrors(null);
  };

  const handleSubmit = async (): Promise<void> => {
    if (file === null) {
      return;
    }

    const csv = await file.text();

    mutation.mutate(csv, buildImportMutationHandlers(closeAndReset, setRowErrors));
  };

  return (
    <Dialog open={open} onOpenChange={buildOpenChangeHandler(setOpen, closeAndReset)}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {adminGuestsImportCopy.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{adminGuestsImportCopy.title}</DialogTitle>
        </DialogHeader>
        <ImportGuestsForm
          rowErrors={rowErrors}
          isPending={mutation.isPending}
          isSubmitDisabled={file === null || mutation.isPending}
          onFileChange={(nextFile) => {
            setFile(nextFile);
            setRowErrors(null);
          }}
          onSubmit={() => {
            void handleSubmit();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
