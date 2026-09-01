export const deleteGuestDialogCopy = {
  trigger: 'Eliminar',
  title: 'Eliminar invitado',
  body: 'Vas a eliminar a {name}. Esta acción no se puede deshacer.',
  confirm: 'Eliminar',
  confirming: 'Eliminando…',
  cancel: 'Cancelar',
} as const;

export const releaseConfirmationDialogCopy = {
  trigger: 'Liberar confirmación',
  title: 'Liberar confirmación',
  body: '{name} ya confirmó su asistencia. Si liberas la confirmación, podrá volver a enviar el formulario desde su invitación.',
  confirm: 'Liberar confirmación',
  confirming: 'Liberando…',
  cancel: 'Cancelar',
} as const;
