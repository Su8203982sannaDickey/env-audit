#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { parseEnvFilesInDirectory, findDuplicateKeys } from "../parser";
import { auditEnvVariables } from "../scanner";
import { buildReport } from "../reporter/reportBuilder";
import { formatHtml } from "../reporter/htmlFormatter";
import { formatMarkdown } from "../reporter/markdownFormatter";
import { formatConsole } from "../reporter/consoleFormatter";
import { formatCsv } from "../reporter/csvFormatter";
import { formatJson } from "../reporter/jsonFormatter";
import { formatXml } from "../reporter/xmlFormatter";
import { formatYaml } from "../reporter/yamlFormatter";
import { formatSarif } from "../reporter/sariffFormatter";
import { formatToml } from "../reporter/tomlFormatter";

export function getFormat(args: string[]): string {
  const idx = args.indexOf("--format");
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return "console";
}

export function getDir(args: string[]): string {
  const idx = args.indexOf("--dir");
  if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);
  return process.cwd();
}

export function getOutput(args: string[]): string | null {
  const idx = args.indexOf("--output");
  if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);
  return null;
}

const formatters: Record<string, (r: ReturnType<typeof buildReport>) => string> = {
  html: formatHtml,
  markdown: formatMarkdown,
  console: formatConsole,
  csv: formatCsv,
  json: formatJson,
  xml: formatXml,
  yaml: formatYaml,
  sarif: formatSarif,
  toml: formatToml,
};

async function main() {
  const args = process.argv.slice(2);
  const dir = getDir(args);
  const format = getFormat(args);
  const output = getOutput(args);

  const envEntries = parseEnvFilesInDirectory(dir);
  const duplicates = findDuplicateKeys(envEntries);
  const auditResult = await auditEnvVariables(dir, envEntries);
  const report = buildReport(auditResult.missing, duplicates, auditResult.undocumented);

  const formatter = formatters[format] ?? formatConsole;
  const result = formatter(report);

  if (output) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, result, "utf-8");
    console.log(`Report written to ${output}`);
  } else {
    process.stdout.write(result);
  }
}

main().catch((err) => {
  console.error("env-audit error:", err);
  process.exit(1);
});
