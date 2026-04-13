import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFilesInDirectory, findDuplicateKeys } from '../parser';
import { auditEnvVariables } from '../scanner';
import { buildReport } from '../reporter/reportBuilder';
import { formatOutput, OutputFormat } from '../reporter/formatters';

export function getFormat(args: string[]): OutputFormat {
  const idx = args.indexOf('--format');
  if (idx !== -1 && args[idx + 1]) {
    const val = args[idx + 1] as OutputFormat;
    const valid: OutputFormat[] = ['text', 'json', 'html', 'markdown', 'csv', 'xml', 'yaml', 'sarif'];
    if (valid.includes(val)) return val;
  }
  return 'text';
}

export function getDir(args: string[]): string {
  const idx = args.indexOf('--dir');
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return process.cwd();
}

export function getOutput(args: string[]): string | null {
  const idx = args.indexOf('--output');
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log([
      'env-audit — scan for missing, duplicate, or undocumented environment variables',
      '',
      'Usage: env-audit [options]',
      '',
      'Options:',
      '  --dir <path>       Directory to scan (default: cwd)',
      '  --format <fmt>     Output format: text, json, html, markdown, csv, xml, yaml, sarif (default: text)',
      '  --output <file>    Write output to file instead of stdout',
      '  --help, -h         Show this help message',
    ].join('\n'));
    process.exit(0);
  }

  const dir = getDir(args);
  const format = getFormat(args);
  const outputFile = getOutput(args);

  const envEntries = parseEnvFilesInDirectory(dir);
  const duplicates = findDuplicateKeys(envEntries);
  const auditResult = await auditEnvVariables(dir, envEntries, duplicates);
  const report = buildReport(dir, auditResult);
  const output = formatOutput(report, format);

  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`Report written to ${outputFile}`);
  } else {
    process.stdout.write(output + '\n');
  }

  const hasErrors = report.issues.some(i => i.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

main().catch(err => {
  console.error('env-audit error:', err);
  process.exit(2);
});
