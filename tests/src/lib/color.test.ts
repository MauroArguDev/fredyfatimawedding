import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  hexToRgb,
  meetsWcagAaForLargeText,
  meetsWcagAaForNormalText,
} from '@/lib/color';

describe('hexToRgb', () => {
  it('parsesEachChannelFromAHexString', () => {
    expect(hexToRgb('#454f42')).toEqual({ red: 0x45, green: 0x4f, blue: 0x42 });
  });

  it('rejectsAStringThatIsNotASixDigitHexColor', () => {
    expect(() => hexToRgb('#fff')).toThrow('Invalid hex color');
  });
});

describe('contrastRatio', () => {
  it('returnsTheMaximumRatioOfTwentyOneForBlackOnWhite', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('returnsOneForIdenticalColors', () => {
    expect(contrastRatio('#454f42', '#454f42')).toBeCloseTo(1, 5);
  });

  it('isSymmetricRegardlessOfArgumentOrder', () => {
    expect(contrastRatio('#454f42', '#f6d5a9')).toBeCloseTo(contrastRatio('#f6d5a9', '#454f42'), 5);
  });
});

describe('meetsWcagAaForNormalText', () => {
  it('acceptsTheVerifiedTextBodyOnBgBasePairing', () => {
    expect(meetsWcagAaForNormalText('#454f42', '#f6d5a9')).toBe(true);
  });

  it('rejectsTextOnSageOverSurfaceSageBecauseTheRatioIsBelowTheAaFloor', () => {
    expect(meetsWcagAaForNormalText('#454F42', '#97A98F')).toBe(false);
  });
});

describe('meetsWcagAaForLargeText', () => {
  it('acceptsTextOnSageOverSurfaceSageAtTheLargeTextThreshold', () => {
    expect(meetsWcagAaForLargeText('#454F42', '#97A98F')).toBe(true);
  });
});
