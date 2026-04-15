import { Report, Issue } from "./types";

interface TrendEntry {
  variable: string;
  severity: string;
  issueType: string;
  occurrences: number;
}

function buildTrendEntry(issue: Issue): TrendEntry {
  return {
    variable: issue.variable,
    severity: issue.severity,
    issueType: issue.type,
    occurrences: issue.locations ? issue.locations.length : 1,
  };
}

function formatTrendRow(entry: TrendEntry, index: number): string {
  const rank = String(index + 1).padStart(3, " ");
  const variable = entry.variable.padEnd(30, " ");
  const severity = entry.severity.padEnd(10, " ");
  const issueType = entry.issueType.padEnd(16, " ");
  const occurrences = String(entry.occurrences).padStart(5, " ");
  return `${rank}  ${variable}  ${severity}  ${issueType}  ${occurrences}`;
}

function formatTrendHeader(): string {
  const rank = "#".padStart(3, " ");
  const variable = "VARIABLE".padEnd(30, " ");
  const severity = "SEVERITY".padEnd(10, " ");
  const issueType = "TYPE".padEnd(16, " ");
  const occurrences = "COUNT";
  return `${rank}  ${variable}  ${severity}  ${issueType}  ${occurrences}`;
}

export function formatTrend(report: Report): string {
  const entries: TrendEntry[] = report.issues
    .map(buildTrendEntry)
    .sort((a, b) => b.occurrences - a.occurrences);

  if (entries.length === 0) {
    return "env-audit trend report\n\nNo issues found.\n";
  }

  const separator = "-".repeat(72);
  const header = formatTrendHeader();
  const rows = entries.map(formatTrendRow).join("\n");

  const totalOccurrences = entries.reduce((sum, e) => sum + e.occurrences, 0);
  const summary = `\nTotal issues: ${entries.length}  |  Total occurrences: ${totalOccurrences}`;

  return [
    "env-audit trend report",
    separator,
    header,
    separator,
    rows,
    separator,
    summary,
    "",
  ].join("\n");
}
