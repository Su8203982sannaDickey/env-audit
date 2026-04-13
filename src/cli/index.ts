import * as fs from "fs";
import * as path from "path";
import { auditEnvVariables } from "../scanner";
import { buildReport } from "../reporter/reportBuilder";
import {
  formatHtml,
  formatMarkdown,
  formatConsole,
  formatCsv,
  formatJson,
  formatXml,
  formatYaml,
  formatSarif,
  formatToml,
  formatJunit,
  formatDotenv,
  formatBadge,
  formatDiff,
  formatTable,
  formatGithubActions,
} from "../reporter";
import { Report } from "../reporter/types";

export type OutputFormat =
  | "console"
  | "json"
  | "html"
  | "markdown"
  | "csv"
  | "xml"
  | "yaml"
  | "sarif"
  | "toml"
  | "junit"
  | "dotenv"
  | "badge"
  | "diff"
  | "table"
  | "github-actions";

export function getFormat(args: string[]): OutputFormat {
  const idx = args.indexOf("--format");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1] as OutputFormat;
  }
  return "console";
}

export function getDir(args: string[]): string {
  const idx = args.indexOf("--dir");
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return process.cwd();
}

export function getOutput(args: string[]): string | undefined {
  const idx = args.indexOf("--output");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return undefined;
}

export function applyFormat(report: Report, format: OutputFormat): string {
  switch (format) {
    case "html":            return formatHtml(report);
    case "markdown":        return formatMarkdown(report);
    case "csv":             return formatCsv(report);
    case "json":            return formatJson(report);
    case "xml":             return formatXml(report);
    case "yaml":            return formatYaml(report);
    case "sarif":           return formatSarif(report);
    case "toml":            return formatToml(report);
    case "junit":           return formatJunit(report);
    case "dotenv":          return formatDotenv(report);
    case "badge":           return formatBadge(report);
    case "diff":            return formatDiff(report);
    case "table":           return formatTable(report);
    case "github-actions":  return formatGithubActions(report);
    case "console":
    default:                return formatConsole(report);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dir = getDir(args);
  const format = getFormat(args);
  const outputFile = getOutput(args);

  const auditResult = await auditEnvVariables(dir);
  const report = buildReport(auditResult);
  const formatted = applyFormat(report, format);

  if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), formatted, "utf-8");
    console.log(`Report written to ${outputFile}`);
  } else {
    console.log(formatted);
  }
}

main().catch((err) => {
  console.error("env-audit error:", err);
  process.exit(1);
});
