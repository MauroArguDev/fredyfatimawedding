const DIACRITIC_MARKS = /[\u0300-\u036f]/g;

export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(DIACRITIC_MARKS, '').toLowerCase();
}
