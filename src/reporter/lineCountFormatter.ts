import { Report, Issue } from "./types";

type LineCountEntry = {
  file: string;
  issueCount: number;
  issues: Issue[];
};

function groupByFile(issues: Issue[]): LineCountEntry[] {
  const map = new Map<string, Issue[]>();

  for (const issue of issues) {
    for (const loc of issue.locations ?? []) {
      const file = loc.file ?? "(unknown)";
      if (!map.has(file)) map.set(file, []);
      map.get(file)!.push(issue);
    }
    if (!issue.locations || issue.locations.length === 0) {
      const key = "(no location)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(issue);
    }
  }

  return Array.from(map.entries())
    .map(([file, issues]) => ({ file, issueCount: issues.length, issues }))
    .sort((a, b) => b.issueCount - a.issueCount);
}

function formatEntryLine(entry: LineCountEntry): string {
  const severities = entry.issues.map((i) => i.severity);
  const high = severities.filter((s) => s === "high").length;
  const medium = severities.filter((s) => s === "medium").length;
  const low = severities.filter((s) => s === "low").length;
  const badge = [high && `H:${high}`, medium && `M:${medium}`, low && `L:${low}`]
    .filter(Boolean)
    .join(" ");
  return `  ${entry.file.padEnd(60)} ${String(entry.issueCount).padStart(4)} issues  [${badge}]`;
}

export function formatLineCount(report: Report): string {
  const entries = groupByFile(report.issues);
  if (entries.length === 0) {
    return "Line Count Report\n\nNo issues found.\n";
  }

  const lines: string[] = [
    "Line Count Report",
    "=".repeat(80),
    `${'File'.padEnd(60)} ${'Count'.padStart(4)}   Severity`,
    "-".repeat(80),
    ...entries.map(formatEntryLine),
    "-".repeat(80),
    `Total: ${report.issues.length} issue(s) across ${entries.length} file(s)`,
    "",
  ];

  return lines.join("\n");
}
