import { describe, expect, it } from 'vitest';
import { normalizeForSearch } from './normalizeForSearch';

describe('normalizeForSearch', () => {
  it('stripsAccentsSoAnUnaccentedQueryStillMatches', () => {
    expect(normalizeForSearch('Íñigo Peña')).toBe('inigo pena');
  });

  it('lowercasesTheValue', () => {
    expect(normalizeForSearch('ORLANDO')).toBe('orlando');
  });

  it('leavesAnAlreadyNormalizedValueUnchanged', () => {
    expect(normalizeForSearch('orlando')).toBe('orlando');
  });
});
