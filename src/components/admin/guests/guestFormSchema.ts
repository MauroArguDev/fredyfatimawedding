import { z } from 'zod';
import {
  MAX_GUEST_LIMIT,
  MAX_NAME_LENGTH,
  MAX_TITLE_LABEL_LENGTH,
  MIN_GUEST_LIMIT,
  guestLimitCoversConfirmedCount,
  phoneSchema,
  type CreateGuestInput,
  type UpdateGuestInput,
} from '@/schemas/guest';

export const guestFormSchema = z.object({
  firstName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  lastName: z.string().trim().max(MAX_NAME_LENGTH),
  titleLabel: z.string().trim().max(MAX_TITLE_LABEL_LENGTH),
  guestLimit: z.coerce.number().int().min(MIN_GUEST_LIMIT).max(MAX_GUEST_LIMIT),
  phone: phoneSchema,
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;

export const editGuestFormSchema = guestFormSchema
  .extend({ confirmedCount: z.coerce.number().int().min(0) })
  .refine((value) => guestLimitCoversConfirmedCount(value.guestLimit, value.confirmedCount), {
    message: 'El cupo no puede ser menor a la cantidad ya confirmada.',
    path: ['guestLimit'],
  });

export type EditGuestFormValues = z.infer<typeof editGuestFormSchema>;

function emptyToNull(value: string): string | null {
  return value.length === 0 ? null : value;
}

export function toCreateGuestInput(values: GuestFormValues): CreateGuestInput {
  return {
    firstName: values.firstName,
    lastName: emptyToNull(values.lastName),
    titleLabel: emptyToNull(values.titleLabel),
    guestLimit: values.guestLimit,
    phone: values.phone,
  };
}

export function toUpdateGuestInput(values: EditGuestFormValues): UpdateGuestInput {
  return { ...toCreateGuestInput(values), confirmedCount: values.confirmedCount };
}
