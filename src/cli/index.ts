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
import { formatJunit } from "../reporter/junitFormatter";
import { formatDotenv } from "../reporter/dotenvFormatter";
import { formatBadge } from "../reporter/badgeFormatter";
import { formatDiff } from "../reporter/diffFormatter";
import { formatTable } from "../reporter/tableFormatter";

const FORMATS = [
  "console", "json", "html", "markdown", "csv",
  "xml", "yaml", "sarif", "toml", "junit",
  "dotenv", "badge", "diff", "table",
] as const;

type Format = typeof FORMATS[number];

export function getFormat(args: string[]): Format {
  const idx = args.indexOf("--format");
  if (idx !== -1 && args[idx + 1]) {
    const val = args[idx + 1] as Format;
    if (FORMATS.includes(val)) return val;
  }
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

function applyFormat(format: Format, report: ReturnType<typeof buildReport>): string {
  switch (format) {
    case "html": return formatHtml(report);
    case "markdown": return formatMarkdown(report);
    case "csv": return formatCsv(report);
    case "json": return formatJson(report);
    case "xml": return formatXml(report);
    case "yaml": return formatYaml(report);
    case "sarif": return formatSarif(report);
    case "toml": return formatToml(report);
    case "junit": return formatJunit(report);
    case "dotenv": return formatDotenv(report);
    case "badge": return formatBadge(report);
    case "diff": return formatDiff(report);
    case "table": return formatTable(report);
    default: return formatConsole(report);
  }
}

export async function run(args: string[]): Promise<void> {
  const dir = getDir(args);
  const format = getFormat(args);
  const output = getOutput(args);

  const envData = parseEnvFilesInDirectory(dir);
  const duplicates = findDuplicateKeys(envData);
  const auditResult = await auditEnvVariables(dir, envData);
  const report = buildReport(auditResult, duplicates);
  const formatted = applyFormat(format, report);

  if (output) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, formatted, "utf-8");
    console.log(`Report written to ${output}`);
  } else {
    process.stdout.write(formatted + "\n");
  }
}

if (require.main === module) {
  run(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
