import * as fs from "fs";
import * as path from "path";
import { auditEnvVariables } from "../scanner";
import {
  buildReport,
  formatOutput,
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
  formatCompact,
  formatTap,
  formatCheckstyle,
} from "../reporter";
import { Report } from "../reporter/types";

export type OutputFormat =
  | "text"
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
  | "github-actions"
  | "compact"
  | "tap"
  | "checkstyle";

export function getFormat(args: string[]): OutputFormat {
  const idx = args.indexOf("--format");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1] as OutputFormat;
  }
  return "text";
}

export function getDir(args: string[]): string {
  const idx = args.indexOf("--dir");
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return process.cwd();
}

export function getOutput(args: string[]): string | null {
  const idx = args.indexOf("--output");
  if (idx !== -1 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return null;
}

export function applyFormat(report: Report, format: OutputFormat): string {
  switch (format) {
    case "json": return formatJson(report);
    case "html": return formatHtml(report);
    case "markdown": return formatMarkdown(report);
    case "csv": return formatCsv(report);
    case "xml": return formatXml(report);
    case "yaml": return formatYaml(report);
    case "sarif": return formatSarif(report);
    case "toml": return formatToml(report);
    case "junit": return formatJunit(report);
    case "dotenv": return formatDotenv(report);
    case "badge": return formatBadge(report);
    case "diff": return formatDiff(report);
    case "table": return formatTable(report);
    case "github-actions": return formatGithubActions(report);
    case "compact": return formatCompact(report);
    case "tap": return formatTap(report);
    case "checkstyle": return formatCheckstyle(report);
    case "text":
    default:
      return formatConsole(report);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dir = getDir(args);
  const format = getFormat(args);
  const outputFile = getOutput(args);

  const auditResult = await auditEnvVariables(dir);
  const report = buildReport(auditResult);
  const output = applyFormat(report, format);

  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, output, "utf-8");
    console.log(`Report written to ${outputFile}`);
  } else {
    process.stdout.write(output + "\n");
  }
}

main().catch((err) => {
  console.error("env-audit error:", err);
  process.exit(1);
});
