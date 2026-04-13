#!/usr/bin/env node
import * as path from "path";
import * as fs from "fs";
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
import { formatJunit } from "../reporter/junitFormatter";
import { formatDotenv } from "../reporter/dotenvFormatter";
import { formatBadge } from "../reporter/badgeFormatter";
import { formatDiff } from "../reporter/diffFormatter";

export function getFormat(args: string[]): string {
  const idx = args.indexOf("--format");
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : "console";
}

export function getDir(args: string[]): string {
  const idx = args.indexOf("--dir");
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : ".";
}

export function getOutput(args: string[]): string | null {
  const idx = args.indexOf("--output");
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const FORMATTERS: Record<string, (r: ReturnType<typeof buildReport>) => string> = {
  console: formatConsole,
  html: formatHtml,
  markdown: formatMarkdown,
  csv: formatCsv,
  json: formatJson,
  xml: formatXml,
  yaml: formatYaml,
  sarif: formatSarif,
  toml: formatToml,
  junit: formatJunit,
  dotenv: formatDotenv,
  badge: formatBadge,
  diff: formatDiff,
};

async function main() {
  const args = process.argv.slice(2);
  const dir = path.resolve(getDir(args));
  const format = getFormat(args);
  const output = getOutput(args);

  const envData = parseEnvFilesInDirectory(dir);
  const duplicates = findDuplicateKeys(envData);
  const audit = await auditEnvVariables(dir, envData);
  const report = buildReport(audit, duplicates);

  const formatter = FORMATTERS[format] ?? formatConsole;
  const result = formatter(report);

  if (output) {
    fs.writeFileSync(path.resolve(output), result, "utf-8");
    console.log(`Report written to ${output}`);
  } else {
    console.log(result);
  }

  const hasErrors = report.issues.some(i => i.severity === "error");
  process.exit(hasErrors ? 1 : 0);
}

main().catch(err => {
  console.error("env-audit error:", err);
  process.exit(2);
});
