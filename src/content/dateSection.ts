export const dateSectionCopy = {
  headingAlt: '¡Nos vamos a casar!',
  subtitle: 'Y será un placer que puedas acompañarnos en esta fecha tan importante.',
  countdownIntro: '¡Empieza la cuenta regresiva!',
  calendarImageAlt: (monthLabel: string, day: number, noteDate: string, noteTime: string): string =>
    `Calendario de ${monthLabel} con el día ${String(day)} marcado con un corazón. Nota: ${noteDate}, ${noteTime}.`,
  countdownUnits: {
    days: { label: 'D', full: 'Días' },
    hours: { label: 'H', full: 'Horas' },
    minutes: { label: 'M', full: 'Min.' },
    seconds: { label: 'S', full: 'Seg.' },
  },
  countdownClosedMessage: '¡Hoy es el gran día!',
} as const;
