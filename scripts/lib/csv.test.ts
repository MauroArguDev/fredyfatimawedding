import { describe, expect, it } from 'vitest';
import { parseCsv, stringifyCsv } from './csv';

describe('parseCsv', () => {
  it('splitsSimpleCommaSeparatedRows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handlesQuotedFieldsContainingCommas', () => {
    expect(parseCsv('firstName,notes\nOrlando,"Bring, if possible, a gift"')).toEqual([
      ['firstName', 'notes'],
      ['Orlando', 'Bring, if possible, a gift'],
    ]);
  });

  it('unescapesDoubledQuotesInsideQuotedFields', () => {
    expect(parseCsv('titleLabel\n"Tío ""Orlando"""')).toEqual([['titleLabel'], ['Tío "Orlando"']]);
  });

  it('preservesAccentsAndTildes', () => {
    expect(parseCsv('firstName\nÍñigo')).toEqual([['firstName'], ['Íñigo']]);
  });

  it('handlesCrlfLineEndings', () => {
    expect(parseCsv('a,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('skipsBlankLines', () => {
    expect(parseCsv('a,b\n1,2\n\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('returnsAnEmptyArrayForEmptyContent', () => {
    expect(parseCsv('')).toEqual([]);
  });
});

describe('stringifyCsv', () => {
  it('joinsPlainFieldsWithCommasAndRowsWithNewlines', () => {
    expect(
      stringifyCsv([
        ['a', 'b'],
        ['1', '2'],
      ]),
    ).toBe('a,b\n1,2');
  });

  it('quotesFieldsThatContainACommaAQuoteOrANewline', () => {
    expect(stringifyCsv([['Tío Orlando, y Familia', 'He said "hi"']])).toBe(
      '"Tío Orlando, y Familia","He said ""hi"""',
    );
  });

  it('roundTripsThroughParseCsv', () => {
    const rows = [
      ['firstName', 'titleLabel'],
      ['Íñigo', 'Tío "Orlando", y Familia'],
    ];

    expect(parseCsv(stringifyCsv(rows))).toEqual(rows);
  });
});
