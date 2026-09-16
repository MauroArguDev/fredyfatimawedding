const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;
const HEX_RADIX = 16;
const BYTE_MASK = 255;
const RED_SHIFT = 16;
const GREEN_SHIFT = 8;

const SRGB_GAMMA_THRESHOLD = 0.03928;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;

const LUMINANCE_WEIGHT_RED = 0.2126;
const LUMINANCE_WEIGHT_GREEN = 0.7152;
const LUMINANCE_WEIGHT_BLUE = 0.0722;

const RELATIVE_LUMINANCE_OFFSET = 0.05;

export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

export const hexToRgb = (hex: string): RgbColor => {
  const match = HEX_COLOR_PATTERN.exec(hex);
  const digits = match?.[1];
  if (!digits) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const value = Number.parseInt(digits, HEX_RADIX);
  return {
    red: (value >> RED_SHIFT) & BYTE_MASK,
    green: (value >> GREEN_SHIFT) & BYTE_MASK,
    blue: value & BYTE_MASK,
  };
};

const toLinearChannel = (channel: number): number => {
  const normalized = channel / BYTE_MASK;
  return normalized <= SRGB_GAMMA_THRESHOLD
    ? normalized / SRGB_LINEAR_DIVISOR
    : ((normalized + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA_EXPONENT;
};

export const relativeLuminance = (color: RgbColor): number => {
  const red = toLinearChannel(color.red);
  const green = toLinearChannel(color.green);
  const blue = toLinearChannel(color.blue);
  return LUMINANCE_WEIGHT_RED * red + LUMINANCE_WEIGHT_GREEN * green + LUMINANCE_WEIGHT_BLUE * blue;
};

export const contrastRatio = (hexA: string, hexB: string): number => {
  const luminanceA = relativeLuminance(hexToRgb(hexA));
  const luminanceB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + RELATIVE_LUMINANCE_OFFSET) / (darker + RELATIVE_LUMINANCE_OFFSET);
};

export const WCAG_AA_NORMAL_TEXT_MIN_RATIO = 4.5;
export const WCAG_AA_LARGE_TEXT_MIN_RATIO = 3;

export const meetsWcagAaForNormalText = (hexA: string, hexB: string): boolean =>
  contrastRatio(hexA, hexB) >= WCAG_AA_NORMAL_TEXT_MIN_RATIO;

export const meetsWcagAaForLargeText = (hexA: string, hexB: string): boolean =>
  contrastRatio(hexA, hexB) >= WCAG_AA_LARGE_TEXT_MIN_RATIO;
