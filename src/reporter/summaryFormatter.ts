import { Report, Issue } from "./types";

function countBySeverity(issues: Issue[]): Record<string, number> {
  return issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
    return acc;
  }, {});
}

function countByType(issues: Issue[]): Record<string, number> {
  return issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.type] = (acc[issue.type] ?? 0) + 1;
    return acc;
  }, {});
}

function formatCountBlock(
  label: string,
  counts: Record<string, number>
): string {
  const lines = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([key, count]) => `  ${key}: ${count}`);
  return `${label}\n${lines.join("\n")}`;
}

/**
 * Returns a short one-line summary string suitable for CI log output,
 * e.g. "env-audit: 3 issues (2 error, 1 warning)".
 */
export function formatOneLiner(report: Report): string {
  const { issues, summary } = report;
  if (issues.length === 0) {
    return "env-audit: no issues found";
  }
  const severityCounts = countBySeverity(issues);
  const breakdown = Object.entries(severityCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([sev, count]) => `${count} ${sev}`)
    .join(", ");
  return `env-audit: ${summary.totalIssues} issue${summary.totalIssues !== 1 ? "s" : ""} (${breakdown})`;
}

export function formatSummary(report: Report): string {
  const { issues, summary } = report;

  if (issues.length === 0) {
    return "env-audit Summary\n==================\nNo issues found. All environment variables are accounted for.\n";
  }

  const severityCounts = countBySeverity(issues);
  const typeCounts = countByType(issues);

  const lines: string[] = [
    "env-audit Summary",
    "==================",
    `Total Issues : ${summary.totalIssues}`,
    `Missing      : ${summary.missing}`,
    `Duplicates   : ${summary.duplicates}`,
    `Undocumented : ${summary.undocumented}`,
    "",
    formatCountBlock("By Severity:", severityCounts),
    "",
    formatCountBlock("By Type:", typeCounts),
  ];

  return lines.join("\n") + "\n";
}
