import { Report, Issue } from "./types";

export function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return "";
  return issue.locations
    .map((loc) => `"${escapeTomlString(loc.file)}:${loc.line ?? 0}"`)
    .join(", ");
}

export function formatIssueToml(issue: Issue, index: number): string {
  const lines: string[] = [];
  lines.push(`[[issues]]`);
  lines.push(`id = ${index + 1}`);
  lines.push(`variable = "${escapeTomlString(issue.variable)}"`); 
  lines.push(`type = "${escapeTomlString(issue.type)}"`); 
  lines.push(`severity = "${escapeTomlString(issue.severity)}"`); 
  lines.push(`message = "${escapeTomlString(issue.message)}"`); 
  const locs = formatLocations(issue);
  if (locs) {
    lines.push(`locations = [${locs}]`);
  } else {
    lines.push(`locations = []`);
  }
  return lines.join("\n");
}

export function formatToml(report: Report): string {
  const lines: string[] = [];
  lines.push(`[summary]`);
  lines.push(`total = ${report.summary.total}`);
  lines.push(`missing = ${report.summary.missing}`);
  lines.push(`duplicate = ${report.summary.duplicate}`);
  lines.push(`undocumented = ${report.summary.undocumented}`);
  lines.push(`errors = ${report.summary.errors}`);
  lines.push(`warnings = ${report.summary.warnings}`);
  lines.push(`info = ${report.summary.info}`);
  lines.push("");
  if (report.issues.length > 0) {
    report.issues.forEach((issue, i) => {
      lines.push(formatIssueToml(issue, i));
      lines.push("");
    });
  }
  return lines.join("\n").trimEnd() + "\n";
}
