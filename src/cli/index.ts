#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { parseEnvFilesInDirectory, findDuplicateKeys } from '../parser';
import { scanDirectoryForEnvUsage } from '../scanner/sourceScanner';
import { auditEnvVariables } from '../scanner';
import { buildReport } from '../reporter/reportBuilder';
import { formatText, formatJson } from '../reporter/formatters';

const program = new Command();

program
  .name('env-audit')
  .description('Audit environment variables across .env files and source code')
  .version('0.1.0');

program
  .command('audit')
  .description('Run a full audit on a project directory')
  .argument('[dir]', 'Project directory to audit', '.')
  .option('-f, --format <format>', 'Output format: text or json', 'text')
  .option('--env-dir <envDir>', 'Directory containing .env files (defaults to <dir>)')
  .option('--src-dir <srcDir>', 'Directory containing source files (defaults to <dir>)')
  .action(async (dir: string, options: { format: string; envDir?: string; srcDir?: string }) => {
    const resolvedDir = path.resolve(dir);
    const envDir = options.envDir ? path.resolve(options.envDir) : resolvedDir;
    const srcDir = options.srcDir ? path.resolve(options.srcDir) : resolvedDir;

    try {
      const envFiles = await parseEnvFilesInDirectory(envDir);
      const duplicates = findDuplicateKeys(envFiles);
      const usages = await scanDirectoryForEnvUsage(srcDir);
      const auditResult = auditEnvVariables(envFiles, usages);

      const report = buildReport({
        missing: auditResult.missing,
        duplicates,
        undocumented: auditResult.undocumented,
      });

      const output =
        options.format === 'json' ? formatJson(report) : formatText(report);

      console.log(output);
      process.exit(report.summary.totalIssues > 0 ? 1 : 0);
    } catch (err) {
      console.error('Error running audit:', (err as Error).message);
      process.exit(2);
    }
  });

program.parse(process.argv);
