import { describe, expect, it } from 'vitest';
import { extractRouteParam } from './httpParams';

describe('extractRouteParam', () => {
  it('returnsTheValueWhenItIsANonEmptyString', () => {
    expect(extractRouteParam({ id: 'abc123' }, 'id')).toBe('abc123');
  });

  it('returnsNullWhenTheParamIsMissing', () => {
    expect(extractRouteParam({}, 'id')).toBeNull();
  });

  it('returnsNullWhenTheParamIsAnEmptyString', () => {
    expect(extractRouteParam({ id: '' }, 'id')).toBeNull();
  });

  it('returnsNullWhenTheParamArrivesAsAnArrayFromADuplicateQueryKey', () => {
    expect(extractRouteParam({ id: ['a', 'b'] }, 'id')).toBeNull();
  });
});
