import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/admin/primitives/input';
import { Field, FieldLabel, FieldError } from '@/components/admin/primitives/field';
import { guestFormFieldsCopy } from '@/content/adminGuestForm';
import type { EditGuestFormValues } from '@/components/admin/guests/guestFormSchema';

interface GuestFormFieldsProps {
  register: UseFormRegister<EditGuestFormValues>;
  errors: FieldErrors<EditGuestFormValues>;
  showConfirmedCount?: boolean;
}

interface GuestFieldProps {
  htmlFor: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
}

const GuestField = ({ htmlFor, label, error, children }: GuestFieldProps): ReactNode => (
  <Field data-invalid={error !== undefined}>
    <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
    {children}
    {error !== undefined && <FieldError>{error}</FieldError>}
  </Field>
);

type TextFieldName = 'firstName' | 'lastName' | 'titleLabel' | 'guestLimit' | 'phone';

interface TextFieldSpec {
  name: TextFieldName;
  id: string;
  label: string;
  isNumber?: boolean;
}

const TEXT_FIELDS: TextFieldSpec[] = [
  { name: 'firstName', id: 'guest-first-name', label: guestFormFieldsCopy.firstName },
  { name: 'lastName', id: 'guest-last-name', label: guestFormFieldsCopy.lastName },
  { name: 'titleLabel', id: 'guest-title-label', label: guestFormFieldsCopy.titleLabel },
  { name: 'guestLimit', id: 'guest-limit', label: guestFormFieldsCopy.guestLimit, isNumber: true },
  { name: 'phone', id: 'guest-phone', label: guestFormFieldsCopy.phone },
];

export const GuestFormFields = ({
  register,
  errors,
  showConfirmedCount = false,
}: GuestFormFieldsProps): ReactNode => {
  return (
    <>
      {TEXT_FIELDS.map((field) => (
        <GuestField
          key={field.name}
          htmlFor={field.id}
          label={field.label}
          error={errors[field.name]?.message}
        >
          {field.isNumber ? (
            <Input id={field.id} type="number" {...register(field.name)} />
          ) : (
            <Input id={field.id} {...register(field.name)} />
          )}
        </GuestField>
      ))}
      {showConfirmedCount && (
        <GuestField
          htmlFor="guest-confirmed-count"
          label={guestFormFieldsCopy.confirmedCount}
          error={errors.confirmedCount?.message}
        >
          <Input id="guest-confirmed-count" type="number" {...register('confirmedCount')} />
        </GuestField>
      )}
    </>
  );
};
