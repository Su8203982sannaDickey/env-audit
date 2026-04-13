#!/usr/bin/env node
import * as path from "path";
import * as fs from "fs";
import { parseEnvFilesInDirectory, findDuplicateKeys } from "../parser";
import { auditEnvVariables } from "../scanner";
import { buildReport } from "../reporter/reportBuilder";
import { formatConsole } from "../reporter/consoleFormatter";
import { formatJson } from "../reporter/jsonFormatter";
import { formatHtml } from "../reporter/htmlFormatter";
import { formatMarkdown } from "../reporter/markdownFormatter";
import { formatCsv } from "../reporter/csvFormatter";
import { formatXml } from "../reporter/xmlFormatter";
import { formatYaml } from "../reporter/yamlFormatter";

type OutputFormat = "console" | "json" | "html" | "markdown" | "csv" | "xml" | "yaml";

function getFormat(args: string[]): OutputFormat {
  const idx = args.indexOf("--format");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1] as OutputFormat;
  }
  return "console";
}

function getDir(args: string[]): string {
  const idx = args.indexOf("--dir");
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return process.cwd();
}

function getOutput(args: string[]): string | null {
  const idx = args.indexOf("--output");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dir = getDir(args);
  const format = getFormat(args);
  const outputFile = getOutput(args);

  const envData = parseEnvFilesInDirectory(dir);
  const duplicates = findDuplicateKeys(envData);
  const auditResult = await auditEnvVariables(dir, envData);
  const report = buildReport(auditResult, duplicates);

  const formatters: Record<OutputFormat, (r: typeof report) => string> = {
    console: formatConsole,
    json: formatJson,
    html: formatHtml,
    markdown: formatMarkdown,
    csv: formatCsv,
    xml: formatXml,
    yaml: formatYaml,
  };

  const formatter = formatters[format] ?? formatConsole;
  const output = formatter(report);

  if (outputFile) {
    fs.writeFileSync(outputFile, output, "utf-8");
    console.log(`Report written to ${outputFile}`);
  } else {
    process.stdout.write(output);
  }
}

main().catch((err) => {
  console.error("env-audit error:", err.message);
  process.exit(1);
});
