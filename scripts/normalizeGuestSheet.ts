import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import ExcelJS from 'exceljs';
import { requireArg, reportRowErrorsAndExit } from './lib/cli';
import { parseCsv, stringifyCsv } from './lib/csv';
import { mapCsvToGuestInputs, REQUIRED_CSV_HEADER } from './lib/guestImport';
import { normalizeHumanGuestSheet } from './lib/humanGuestSheet';
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

const GUEST_SHEET_NAME = 'Invitados';

function readArgs(): { inputPath: string; outputPath: string } {
  const inputPath = requireArg(
    2,
    'Usage: npm run normalize:guests -- <path-to-xlsx-or-csv> [output-path]',
  );
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

  if (value.result instanceof Date || typeof value.result !== 'object') {
    return scalarToString(value.result);
  }

  return stringifyCellObject(value.result);
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'object' && !(value instanceof Date)
    ? stringifyCellObject(value)
    : scalarToString(value);
}

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

async function main(): Promise<void> {
  const { inputPath, outputPath } = readArgs();
  const rows = await readRows(inputPath);
  const normalized = normalizeHumanGuestSheet(rows);

  if (normalized.errors.length > 0) {
    reportRowErrorsAndExit('Could not read the sheet, nothing was written:', normalized.errors);
  }

  const machineRows = [[...REQUIRED_CSV_HEADER], ...normalized.rows];
  const validation = mapCsvToGuestInputs(machineRows);

  if (validation.errors.length > 0) {
    reportRowErrorsAndExit(
      'Fix these rows before importing, nothing was written:',
      validation.errors,
    );
  }

  writeFileSync(outputPath, stringifyCsv(machineRows), 'utf8');
  console.warn(`${String(validation.guests.length)} guest(s) ready. Wrote ${outputPath}.`);
  console.warn(`Next: npm run import:guests -- "${outputPath}"`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
