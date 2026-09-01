export const guestFormFieldsCopy = {
  firstName: 'Nombre',
  lastName: 'Apellido',
  titleLabel: 'Trato para el sobre',
  guestLimit: 'Cupo de invitados',
  phone: 'Teléfono',
  notes: 'Notas',
  confirmedCount: 'Cantidad confirmada',
} as const;

export const createGuestDialogCopy = {
  trigger: 'Agregar invitado',
  title: 'Agregar invitado',
  submit: 'Crear',
  submitting: 'Creando…',
  cancel: 'Cancelar',
} as const;

export const editGuestDialogCopy = {
  trigger: 'Editar',
  title: 'Editar invitado',
  submit: 'Guardar',
  submitting: 'Guardando…',
  cancel: 'Cancelar',
} as const;

export const adminGuestToastCopy = {
  created: 'Invitado creado.',
  updated: 'Invitado actualizado.',
  deleted: 'Invitado eliminado.',
  released: 'Confirmación liberada.',
  sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
} as const;

export type AdminGuestErrorCode =
  | 'INVALID_PAYLOAD'
  | 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNKNOWN';

export const adminGuestFormErrorCopy: Record<AdminGuestErrorCode, string> = {
  INVALID_PAYLOAD: 'Revisa los datos del formulario; algún campo no es válido.',
  GUEST_LIMIT_BELOW_CONFIRMED_COUNT: 'El cupo no puede ser menor a la cantidad ya confirmada.',
  NOT_FOUND: 'Este invitado ya no existe. Actualiza la página.',
  UNAUTHORIZED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  NETWORK: 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
  UNKNOWN: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

function isKnownAdminGuestErrorCode(code: string): code is AdminGuestErrorCode {
  return Object.hasOwn(adminGuestFormErrorCopy, code);
}

export function resolveAdminGuestErrorMessage(code: string): string {
  return isKnownAdminGuestErrorCode(code)
    ? adminGuestFormErrorCopy[code]
    : adminGuestFormErrorCopy.UNKNOWN;
}
