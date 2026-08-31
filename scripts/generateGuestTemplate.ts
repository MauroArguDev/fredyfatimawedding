import ExcelJS from 'exceljs';
import { HUMAN_SHEET_HEADER } from './lib/humanGuestSheet';

const DEFAULT_OUTPUT_PATH = 'Lista de invitados - Fredy y Fatima.xlsx';
const HEADER_FILL_COLOR = 'FFEFEFEF';
const INSTRUCTIONS_COLUMN_WIDTH = 90;
const TITLE_FONT_SIZE = 14;

const INSTRUCTIONS = [
  'Cómo llenar esta lista',
  '',
  '1. No cambien los encabezados de la hoja "Invitados" (la fila 1). El sistema los lee tal cual.',
  '2. Una fila = una invitación (un grupo, no una persona). "Cupo de invitados" es cuántas personas puede confirmar ese grupo en total.',
  '3. "Trato para el sobre" es el texto que va a ver el invitado en el sobre, por ejemplo "Tío Orlando y Familia." Si lo dejan vacío, se usa Nombre + Apellido.',
  '4. Teléfono: escríbanlo como les salga natural (7000-0000, 7000 0000, +503 7000 0000). No hace falta un formato especial.',
  '5. No dejen filas vacías en medio de la lista; agreguen todas las filas que necesiten al final.',
  '6. Cuando terminen, guarden el archivo y devuélvanlo tal cual, en formato .xlsx, sin exportarlo a otro formato.',
];

function buildInstructionsSheet(workbook: ExcelJS.Workbook): void {
  const sheet = workbook.addWorksheet('Instrucciones');
  sheet.columns = [{ width: INSTRUCTIONS_COLUMN_WIDTH }];

  INSTRUCTIONS.forEach((text, index) => {
    sheet.getCell(index + 1, 1).value = text;
  });
  sheet.getCell(1, 1).font = { bold: true, size: TITLE_FONT_SIZE };
}

function buildGuestSheet(workbook: ExcelJS.Workbook): void {
  const sheet = workbook.addWorksheet('Invitados');
  sheet.columns = [
    { header: HUMAN_SHEET_HEADER[0], key: 'firstName', width: 20 },
    { header: HUMAN_SHEET_HEADER[1], key: 'lastName', width: 20 },
    { header: HUMAN_SHEET_HEADER[2], key: 'titleLabel', width: 32 },
    { header: HUMAN_SHEET_HEADER[3], key: 'guestLimit', width: 18 },
    { header: HUMAN_SHEET_HEADER[4], key: 'phone', width: 18 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } };

  sheet.addRow({
    firstName: 'Orlando',
    lastName: 'Martínez',
    titleLabel: 'Tío Orlando y Familia.',
    guestLimit: 3,
    phone: '7000-0000',
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

async function main(): Promise<void> {
  const outputPath = process.argv[2] ?? DEFAULT_OUTPUT_PATH;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'fredyfatimawedding';

  buildInstructionsSheet(workbook);
  buildGuestSheet(workbook);

  await workbook.xlsx.writeFile(outputPath);
  console.warn(`Wrote ${outputPath}`);
}

await main();
