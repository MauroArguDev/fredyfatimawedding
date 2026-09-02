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
  titleLabel: 'Trato',
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
