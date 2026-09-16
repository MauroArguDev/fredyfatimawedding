export interface ColorToken {
  cssVariable: string;
  utilityName: string;
  hexValue: string;
  usage: string;
  verified: boolean;
}

export const colorTokens: ColorToken[] = [
  {
    cssVariable: '--color-bg-base',
    utilityName: 'bg-base',
    hexValue: '#F6D5A9',
    usage:
      'Page background behind every section (verified: fill of "Contenedor cuerpo de la invitación")',
    verified: true,
  },
  {
    cssVariable: '--color-bg-hero',
    utilityName: 'bg-hero',
    hexValue: '#F6D5A9',
    usage: 'Vignette fade over the cover photo (verified: gradient stop in "Contenedor portada")',
    verified: true,
  },
  {
    cssVariable: '--color-envelope-text',
    utilityName: 'envelope-text',
    hexValue: '#465641',
    usage: '"Para:" and titleLabel on the envelope',
    verified: true,
  },
  {
    cssVariable: '--color-surface-dark',
    utilityName: 'surface-dark',
    hexValue: '#48553F',
    usage: 'Calendar card, select (sampled from the flattened mockup, not pixel-measured)',
    verified: false,
  },
  {
    cssVariable: '--color-surface-sage',
    utilityName: 'surface-sage',
    hexValue: '#97A98F',
    usage: 'Countdown card, submit button (approximate, no native fill found yet)',
    verified: false,
  },
  {
    cssVariable: '--color-surface-muted',
    utilityName: 'surface-muted',
    hexValue: '#EBC9A0',
    usage: 'RSVP panel background (approximate, lives inside a flattened mockup image)',
    verified: false,
  },
  {
    cssVariable: '--color-accent-coral',
    utilityName: 'accent-coral',
    hexValue: '#E5AB84',
    usage: 'Photo frames, hour tag (verified: divider gradient in "caminar juntos")',
    verified: true,
  },
  {
    cssVariable: '--color-accent-terracotta',
    utilityName: 'accent-terracotta',
    hexValue: '#20431E',
    usage: 'Emphasized text (verified: "juntos para siempre" / "Sí" in the v2 file)',
    verified: true,
  },
  {
    cssVariable: '--color-text-heading',
    utilityName: 'text-heading',
    hexValue: '#4A5A46',
    usage: 'Script section titles (approximate, those titles are flattened mockup images)',
    verified: false,
  },
  {
    cssVariable: '--color-text-body',
    utilityName: 'text-body',
    hexValue: '#454F42',
    usage: 'Paragraph text (verified: every native Inter text node in the v2 file)',
    verified: true,
  },
  {
    cssVariable: '--color-text-on-dark',
    utilityName: 'text-on-dark',
    hexValue: '#F6D5A9',
    usage: 'Text over surface-dark, e.g. the select',
    verified: true,
  },
  {
    cssVariable: '--color-text-on-sage',
    utilityName: 'text-on-sage',
    hexValue: '#454F42',
    usage: 'Text over surface-sage, e.g. "Enviar"',
    verified: true,
  },
  {
    cssVariable: '--color-text-hero',
    utilityName: 'text-hero',
    hexValue: '#FFFFFF',
    usage: 'Names on the cover (verified: "Fredy y Fátima" in the v2 file)',
    verified: true,
  },
];

export interface ContrastCheck {
  label: string;
  foregroundHex: string;
  backgroundHex: string;
  requiresLargeText: boolean;
}

export const contrastChecks: ContrastCheck[] = [
  {
    label: 'text-body on bg-base',
    foregroundHex: '#454F42',
    backgroundHex: '#F6D5A9',
    requiresLargeText: false,
  },
  {
    label: 'text-on-dark on surface-dark',
    foregroundHex: '#F6D5A9',
    backgroundHex: '#48553F',
    requiresLargeText: false,
  },
  {
    label: 'text-on-sage on surface-sage',
    foregroundHex: '#454F42',
    backgroundHex: '#97A98F',
    requiresLargeText: false,
  },
  {
    label: 'accent-terracotta on bg-base',
    foregroundHex: '#20431E',
    backgroundHex: '#F6D5A9',
    requiresLargeText: false,
  },
];
