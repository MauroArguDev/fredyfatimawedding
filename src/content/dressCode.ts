export interface DressCodeColor {
  hex: string;
  name: string;
}

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
    colors: [
      { hex: '#ffffff', name: 'Blanco' },
      { hex: '#edd7ca', name: 'Beige rosado' },
      { hex: '#f3f9fc', name: 'Celeste muy pálido' },
      { hex: '#fce6d7', name: 'Durazno pálido' },
      { hex: '#fff9df', name: 'Crema' },
    ] as const satisfies readonly DressCodeColor[],
  },
  men: {
    heading: 'Hombres',
    avoidNote: 'Evitar los tonos verde menta, militar y sus variaciones.',
    colors: [
      { hex: '#454f42', name: 'Verde militar oscuro' },
      { hex: '#9eb596', name: 'Verde menta' },
      { hex: '#74886d', name: 'Verde militar' },
      { hex: '#adc9a2', name: 'Verde menta claro' },
      { hex: '#b5ceab', name: 'Verde menta pálido' },
    ] as const satisfies readonly DressCodeColor[],
  },
} as const;
