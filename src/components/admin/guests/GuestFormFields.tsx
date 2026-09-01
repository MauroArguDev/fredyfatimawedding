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

export const GuestFormFields = ({
  register,
  errors,
  showConfirmedCount = false,
}: GuestFormFieldsProps): ReactNode => {
  return (
    <>
      <Field data-invalid={errors.firstName !== undefined}>
        <FieldLabel htmlFor="guest-first-name">{guestFormFieldsCopy.firstName}</FieldLabel>
        <Input id="guest-first-name" {...register('firstName')} />
        {errors.firstName !== undefined && <FieldError>{errors.firstName.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.lastName !== undefined}>
        <FieldLabel htmlFor="guest-last-name">{guestFormFieldsCopy.lastName}</FieldLabel>
        <Input id="guest-last-name" {...register('lastName')} />
        {errors.lastName !== undefined && <FieldError>{errors.lastName.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.titleLabel !== undefined}>
        <FieldLabel htmlFor="guest-title-label">{guestFormFieldsCopy.titleLabel}</FieldLabel>
        <Input id="guest-title-label" {...register('titleLabel')} />
        {errors.titleLabel !== undefined && <FieldError>{errors.titleLabel.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.guestLimit !== undefined}>
        <FieldLabel htmlFor="guest-limit">{guestFormFieldsCopy.guestLimit}</FieldLabel>
        <Input id="guest-limit" type="number" {...register('guestLimit')} />
        {errors.guestLimit !== undefined && <FieldError>{errors.guestLimit.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.phone !== undefined}>
        <FieldLabel htmlFor="guest-phone">{guestFormFieldsCopy.phone}</FieldLabel>
        <Input id="guest-phone" {...register('phone')} />
        {errors.phone !== undefined && <FieldError>{errors.phone.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.notes !== undefined}>
        <FieldLabel htmlFor="guest-notes">{guestFormFieldsCopy.notes}</FieldLabel>
        <Input id="guest-notes" {...register('notes')} />
        {errors.notes !== undefined && <FieldError>{errors.notes.message}</FieldError>}
      </Field>
      {showConfirmedCount && (
        <Field data-invalid={errors.confirmedCount !== undefined}>
          <FieldLabel htmlFor="guest-confirmed-count">
            {guestFormFieldsCopy.confirmedCount}
          </FieldLabel>
          <Input id="guest-confirmed-count" type="number" {...register('confirmedCount')} />
          {errors.confirmedCount !== undefined && (
            <FieldError>{errors.confirmedCount.message}</FieldError>
          )}
        </Field>
      )}
    </>
  );
};
