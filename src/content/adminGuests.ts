export const adminGuestsStatsCopy = {
  total: 'Total',
  confirmed: 'Confirmados',
  pending: 'Pendientes',
  openedNotConfirmed: 'Abiertos sin confirmar',
  totalConfirmedPeople: 'Personas confirmadas',
} as const;

export const adminGuestsFiltersCopy = {
  searchPlaceholder: 'Buscar por nombre, apellido o teléfono',
  searchLabel: 'Buscar invitados',
  statusLabel: 'Filtrar por estado',
  statusAll: 'Todos',
  statusConfirmed: 'Confirmados',
  statusPending: 'Pendientes',
} as const;

export const adminGuestsTableCopy = {
  titleLabel: 'Texto en sobre',
  firstName: 'Nombre',
  lastName: 'Apellido',
  phone: 'Teléfono',
  guestLimit: 'Cupo',
  status: 'Estado',
  confirmedCount: 'Confirmados',
  firstOpenedAt: 'Abierto',
  statusConfirmed: 'Confirmado',
  statusPending: 'Pendiente',
  never: '—',
  sortByName: 'Ordenar por nombre',
  sortByStatus: 'Ordenar por estado',
  actionsColumn: 'Acciones',
} as const;

export const adminGuestsPageCopy = {
  loading: 'Cargando invitados…',
  errorMessage: 'No pudimos cargar la lista de invitados.',
  retry: 'Reintentar',
  emptyList: 'Todavía no hay invitados cargados.',
  emptyFiltered: 'Ningún invitado coincide con la búsqueda o el filtro.',
} as const;

export const adminGuestsExportCopy = {
  trigger: 'Exportar CSV',
  downloading: 'Exportando…',
  error: 'No pudimos exportar la lista de invitados.',
} as const;

export const adminGuestsImportCopy = {
  trigger: 'Importar CSV',
  title: 'Importar invitados desde CSV',
  fileLabel: 'Archivo CSV',
  fileHint: 'Encabezado: Nombre, Apellido, Texto en sobre, Cupo de invitados, Teléfono.',
  submit: 'Importar',
  submitting: 'Importando…',
  genericError: 'No pudimos importar el archivo. Revisa que sea un CSV válido e intenta de nuevo.',
  rowErrorsHeading: 'Revisa estas filas y vuelve a intentar:',
} as const;

export function buildGuestImportSuccessMessage(imported: number, skipped: number): string {
  const skippedSuffix = skipped > 0 ? `, ${String(skipped)} omitidos (ya existían)` : '';

  return `${String(imported)} invitados importados${skippedSuffix}.`;
}

export function buildGuestImportRowErrorLabel(row: number, message: string): string {
  return `Fila ${String(row)}: ${message}`;
}
