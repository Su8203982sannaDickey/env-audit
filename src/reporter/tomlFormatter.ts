import { Report, Issue } from "./types";

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return "";
  return issue.locations
    .map((loc) => `  [[issues.locations]]\n  file = "${escapeTomlString(loc.file)}"\n  line = ${loc.line ?? 0}`)
    .join("\n");
}

function formatIssueToml(issue: Issue): string {
  const lines: string[] = [
    `[[issues]]`,
    `variable = "${escapeTomlString(issue.variable)}"`,
    `type = "${escapeTomlString(issue.type)}"`,
    `severity = "${escapeTomlString(issue.severity)}"`,
    `message = "${escapeTomlString(issue.message)}"`,
  ];
  const locs = formatLocations(issue);
  if (locs) lines.push(locs);
  return lines.join("\n");
}

export function formatToml(report: Report): string {
  const sections: string[] = [];

  sections.push(`[summary(`total = ${report.summary.total}`);
  sections.push(`missing = ${report.summary.missing}`);
  sections.push(`duplicate = ${report.summary.duplicate}`);
  sections.push(`undocumented = ${report.summary.undocumented}`);
  sections.push(`scannedFiles = ${report.summary.scannedFiles}`);
  sections.push(`envFiles = ${report.summary.envFiles}`);

  if (report.issues.length > 0) {
    sections.push("");
    sections.push(report.issues.map(formatIssueToml).join("\n\n"));
  }

  return sections.join("\n") + "\n";
}
