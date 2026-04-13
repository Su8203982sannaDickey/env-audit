import { Report, Issue } from "./types";

type GroupedIssues = Record<string, Issue[]>;

function groupBySeverity(issues: Issue[]): GroupedIssues {
  const groups: GroupedIssues = { error: [], warning: [], info: [] };
  for (const issue of issues) {
    const key = issue.severity ?? "info";
    if (!groups[key]) groups[key] = [];
    groups[key].push(issue);
  }
  return groups;
}

function formatGroup(severity: string, issues: Issue[]): string {
  if (issues.length === 0) return "";
  const lines: string[] = [];
  lines.push(`[${severity.toUpperCase()}] (${issues.length})`);
  for (const issue of issues) {
    const locs =
      issue.locations && issue.locations.length > 0
        ? issue.locations
            .map((l) => (l.line != null ? `${l.file}:${l.line}` : l.file))
            .join(", ")
        : "no location";
    lines.push(`  - ${issue.variable}: ${issue.message} [${locs}]`);
  }
  return lines.join("\n");
}

export function formatGrouped(report: Report): string {
  const lines: string[] = [];
  lines.push("env-audit grouped report");
  lines.push(
    `Total: ${report.summary.totalIssues} | ` +
    `Errors: ${report.summary.errorCount} | ` +
    `Warnings: ${report.summary.warningCount} | ` +
    `Info: ${report.summary.infoCount}`
  );
  lines.push("");

  if (report.issues.length === 0) {
    lines.push("No issues found.");
    return lines.join("\n");
  }

  const groups = groupBySeverity(report.issues);
  for (const severity of ["error", "warning", "info"]) {
    const section = formatGroup(severity, groups[severity] ?? []);
    if (section) {
      lines.push(section);
      lines.push("");
    }
  }

  return lines.join("\n").trimEnd();
}
