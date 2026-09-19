const buildAvoidColorsAlt = (colorNames: readonly string[]): string =>
  `Colores a evitar: ${colorNames.join(', ')}.`;

export const dressCodeCopy = {
  titleAlt: 'Código de Vestimenta',
  coupleIllustrationAlt: 'Ilustración de una pareja vestida de manera formal',
  note: 'Recuerda, lo más importante para nosotros es que estés cómodo.\n\nPero nos gustaría que la vestimenta fuera formal.',
  avoidColorsIntro:
    'De igual forma te pedimos que, dentro de lo posible, evites los siguientes colores:',
  women: {
    heading: 'Mujeres',
    avoidNote:
      'Evitar los colores blanco o similares, ya que son reservados exclusivamente para la novia.',
    avoidColorsImageAlt: buildAvoidColorsAlt([
      'Blanco',
      'Beige rosado',
      'Celeste muy pálido',
      'Durazno pálido',
      'Crema',
    ]),
  },
  men: {
    heading: 'Hombres',
    avoidNote: 'Evitar los tonos verde menta, militar y sus variaciones.',
    avoidColorsImageAlt: buildAvoidColorsAlt([
      'Verde militar oscuro',
      'Verde menta',
      'Verde militar',
      'Verde menta claro',
      'Verde menta pálido',
    ]),
  },
} as const;
