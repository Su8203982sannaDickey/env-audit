import * as fs from "fs";
import * as path from "path";
import { auditEnvVariables } from "../scanner";
import { buildReport } from "../reporter/reportBuilder";
import { formatOutput } from "../reporter/formatters";
import { formatHtml } from "../reporter/htmlFormatter";
import { formatMarkdown } from "../reporter/markdownFormatter";
import { formatJson } from "../reporter/jsonFormatter";
import { formatXml } from "../reporter/xmlFormatter";
import { formatYaml } from "../reporter/yamlFormatter";
import { formatSarif } from "../reporter/sariffFormatter";
import { formatToml } from "../reporter/tomlFormatter";
import { formatJunit } from "../reporter/junitFormatter";
import { formatDotenv } from "../reporter/dotenvFormatter";
import { formatBadge } from "../reporter/badgeFormatter";
import { formatDiff } from "../reporter/diffFormatter";
import { formatTable } from "../reporter/tableFormatter";
import { formatGithubActions } from "../reporter/githubActionsFormatter";
import { formatCompact } from "../reporter/compactFormatter";
import { formatTap } from "../reporter/tapFormatter";
import { formatCheckstyle } from "../reporter/checkstyleFormatter";
import { formatTemplate } from "../reporter/templateFormatter";
import { formatCodeframe } from "../reporter/codeframeFormatter";
import { formatGrouped } from "../reporter/groupedFormatter";
import { formatSonarqube } from "../reporter/sonarqubeFormatter";
import { formatCsv } from "../reporter/csvFormatter";
import { formatConsole } from "../reporter/consoleFormatter";
import { formatTsv } from "../reporter/tsvFormatter";
import { Report } from "../reporter/types";

export function getFormat(argv: string[]): string {
  const idx = argv.indexOf("--format");
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : "console";
}

export function getDir(argv: string[]): string {
  const idx = argv.indexOf("--dir");
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : process.cwd();
}

export function getOutput(argv: string[]): string | null {
  const idx = argv.indexOf("--output");
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : null;
}

export function applyFormat(format: string, report: Report, templatePath?: string): string {
  switch (format) {
    case "html":          return formatHtml(report);
    case "markdown":      return formatMarkdown(report);
    case "json":          return formatJson(report);
    case "xml":           return formatXml(report);
    case "yaml":          return formatYaml(report);
    case "sarif":         return formatSarif(report);
    case "toml":          return formatToml(report);
    case "junit":         return formatJunit(report);
    case "dotenv":        return formatDotenv(report);
    case "badge":         return formatBadge(report);
    case "diff":          return formatDiff(report);
    case "table":         return formatTable(report);
    case "github-actions":return formatGithubActions(report);
    case "compact":       return formatCompact(report);
    case "tap":           return formatTap(report);
    case "checkstyle":    return formatCheckstyle(report);
    case "template":      return formatTemplate(report, templatePath);
    case "codeframe":     return formatCodeframe(report);
    case "grouped":       return formatGrouped(report);
    case "sonarqube":     return formatSonarqube(report);
    case "csv":           return formatCsv(report);
    case "tsv":           return formatTsv(report);
    case "text":          return formatOutput(report);
    case "console":
    default:              return formatConsole(report);
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const format = getFormat(argv);
  const dir = getDir(argv);
  const output = getOutput(argv);
  const templateIdx = argv.indexOf("--template");
  const templatePath = templateIdx !== -1 && argv[templateIdx + 1]
    ? argv[templateIdx + 1]
    : undefined;

  const audit = await auditEnvVariables(dir);
  const report = buildReport(audit);
  const formatted = applyFormat(format, report, templatePath);

  if (output) {
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    fs.writeFileSync(output, formatted, "utf-8");
    console.log(`Report written to ${output}`);
  } else {
    process.stdout.write(formatted);
  }

  const hasErrors = report.summary.errors > 0;
  process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
  console.error("env-audit error:", err);
  process.exit(2);
});
