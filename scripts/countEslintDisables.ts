import { globSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';

const MAX_DISABLES = 10;
const DISABLE_PATTERN = /(\/\/|\/\*)\s*eslint-disable/;
const FILE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx', 'api/**/*.ts', 'scripts/**/*.ts'];

interface Finding {
  file: string;
  line: number;
  text: string;
}

function collectFindings(): Finding[] {
  const findings: Finding[] = [];

  for (const pattern of FILE_GLOBS) {
    for (const file of globSync(pattern)) {
      const lines = readFileSync(file, 'utf8').split('\n');

      lines.forEach((text, index) => {
        if (DISABLE_PATTERN.test(text)) {
          findings.push({ file: relative(process.cwd(), file), line: index + 1, text: text.trim() });
        }
      });
    }
  }

  return findings;
}

const findings = collectFindings();

for (const finding of findings) {
  console.warn(`${finding.file}:${String(finding.line)}  ${finding.text}`);
}

console.warn(`${String(findings.length)} lint suppressions found, budget is ${String(MAX_DISABLES)}.`);

if (findings.length > MAX_DISABLES) {
  console.error(
    'Budget exceeded. Fix the code or change the rule in eslint.config.ts. Do not add another suppression.',
  );
  process.exit(1);
}
