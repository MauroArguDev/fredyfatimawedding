const MILESTONES = [
  { time: '4:30 p.m.', label: 'Ceremonia Religiosa' },
  { time: '5:30 p.m.', label: 'Fotos' },
  { time: '6:00 p.m.', label: 'Primer Baile de Esposos' },
  { time: '6:30 p.m.', label: 'Cena' },
  { time: '7:30 p.m.', label: 'Pastel' },
  { time: '8:00 p.m.', label: 'Fiesta/Baile' },
  { time: '9:00 p.m.', label: 'Despedida y recuerdos' },
] as const;

export const timelineCopy = {
  titleAlt: 'Itinerario.',
  fullImageAlt: `Itinerario del día: ${MILESTONES.map((m) => `${m.time} ${m.label}`).join(', ')}.`,
} as const;
