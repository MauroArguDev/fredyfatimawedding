interface CsvParseState {
  rows: string[][];
  row: string[];
  field: string;
  inQuotes: boolean;
  skipNext: boolean;
  delimiter: string;
}

function pushField(state: CsvParseState): void {
  state.row.push(state.field);
  state.field = '';
}

function pushRow(state: CsvParseState): void {
  pushField(state);
  state.rows.push(state.row);
  state.row = [];
}

function consumeQuotedChar(state: CsvParseState, char: string, nextChar: string): void {
  if (char === '"' && nextChar === '"') {
    state.field += '"';
    state.skipNext = true;
  } else if (char === '"') {
    state.inQuotes = false;
  } else {
    state.field += char;
  }
}

function consumeUnquotedChar(state: CsvParseState, char: string): void {
  if (char === '"') {
    state.inQuotes = true;
  } else if (char === state.delimiter) {
    pushField(state);
  } else if (char === '\n') {
    pushRow(state);
  } else {
    state.field += char;
  }
}

function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] ?? '';
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;

  return semicolonCount > commaCount ? ';' : ',';
}

export function parseCsv(content: string): string[][] {
  const text = content.replace(/\r\n/g, '\n');
  const state: CsvParseState = {
    rows: [],
    row: [],
    field: '',
    inQuotes: false,
    skipNext: false,
    delimiter: detectDelimiter(text),
  };

  for (let index = 0; index < text.length; index += 1) {
    if (state.skipNext) {
      state.skipNext = false;
      continue;
    }

    const char = text.charAt(index);

    if (state.inQuotes) {
      consumeQuotedChar(state, char, text.charAt(index + 1));
    } else {
      consumeUnquotedChar(state, char);
    }
  }

  if (state.field.length > 0 || state.row.length > 0) {
    pushRow(state);
  }

  return state.rows.filter((row) => row.some((value) => value.trim().length > 0));
}

function needsQuoting(value: string): boolean {
  return value.includes(',') || value.includes('"') || value.includes('\n');
}

function stringifyField(value: string): string {
  return needsQuoting(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function stringifyCsv(rows: string[][]): string {
  return rows.map((row) => row.map(stringifyField).join(',')).join('\n');
}
