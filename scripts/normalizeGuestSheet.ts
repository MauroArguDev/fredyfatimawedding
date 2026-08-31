import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import ExcelJS from 'exceljs';
import { parseCsv, stringifyCsv } from './lib/csv';
import { mapCsvToGuestInputs, REQUIRED_CSV_HEADER } from './lib/guestImport';
import { normalizeHumanGuestSheet } from './lib/humanGuestSheet';
import type { GuestImportRowError } from './lib/guestImport';
import type {
  CellErrorValue,
  CellFormulaValue,
  CellHyperlinkValue,
  CellRichTextValue,
  CellSharedFormulaValue,
} from 'exceljs';

type CellObjectValue =
  | CellErrorValue
  | CellRichTextValue
  | CellHyperlinkValue
  | CellFormulaValue
  | CellSharedFormulaValue;

function readArgs(): { inputPath: string; outputPath: string } {
  const inputPath = process.argv[2];

  if (inputPath === undefined) {
    console.error('Usage: npm run normalize:guests -- <path-to-xlsx-or-csv> [output-path]');
    process.exit(1);
  }

  const defaultOutput = join(
    dirname(inputPath),
    `${basename(inputPath, extname(inputPath))}.import-ready.csv`,
  );

  return { inputPath, outputPath: process.argv[3] ?? defaultOutput };
}

function scalarToString(value: string | number | boolean | Date): string {
  if (typeof value === 'string') {
    return value;
  }

  return value instanceof Date ? value.toISOString() : String(value);
}

function stringifyCellObject(value: CellObjectValue): string {
  if ('error' in value) {
    return value.error;
  }

  if ('richText' in value) {
    return value.richText.map((part) => part.text).join('');
  }

  if ('hyperlink' in value) {
    return value.text;
  }

  if (value.result === undefined) {
    return '';
  }

  return typeof value.result === 'object'
    ? stringifyCellObject(value.result)
    : scalarToString(value.result);
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'object' && !(value instanceof Date)
    ? stringifyCellObject(value)
    : scalarToString(value);
}

const GUEST_SHEET_NAME = 'Invitados';

async function readXlsxRows(path: string): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const worksheet = workbook.getWorksheet(GUEST_SHEET_NAME) ?? workbook.worksheets[0];
  const rows: string[][] = [];

  worksheet?.eachRow((row) => {
    const cells = (row.values as ExcelJS.CellValue[]).slice(1).map(cellToString);

    if (cells.some((cell) => cell.trim().length > 0)) {
      rows.push(cells);
    }
  });

  return rows;
}

async function readRows(path: string): Promise<string[][]> {
  if (extname(path).toLowerCase() === '.csv') {
    return parseCsv(readFileSync(path, 'utf8'));
  }

  return readXlsxRows(path);
}

function reportErrors(title: string, errors: GuestImportRowError[]): never {
  console.error(title);
  for (const error of errors) {
    console.error(`  Row ${String(error.row)}: ${error.message}`);
  }
  process.exit(1);
}

async function main(): Promise<void> {
  const { inputPath, outputPath } = readArgs();
  const rows = await readRows(inputPath);
  const normalized = normalizeHumanGuestSheet(rows);

  if (normalized.errors.length > 0) {
    reportErrors('Could not read the sheet, nothing was written:', normalized.errors);
  }

  const machineRows = [[...REQUIRED_CSV_HEADER], ...normalized.rows];
  const validation = mapCsvToGuestInputs(machineRows);

  if (validation.errors.length > 0) {
    reportErrors('Fix these rows before importing, nothing was written:', validation.errors);
  }

  writeFileSync(outputPath, stringifyCsv(machineRows), 'utf8');
  console.warn(`${String(validation.guests.length)} guest(s) ready. Wrote ${outputPath}.`);
  console.warn(`Next: npm run import:guests -- "${outputPath}"`);
}

await main();
