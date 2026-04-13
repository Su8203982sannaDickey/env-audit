import { Report, Issue } from "./types";

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return "";
  return issue.locations
    .map((loc) => `"${escapeTomlString(loc.file)}:${loc.line ?? 0)}"`)
    .join(", ");
}

function formatIssueToml( index: string[] = [];
  lines.push(`[[issues]]id = ${index + 1}`);
  lines.push(`variable = "${escapeTomlString(issue.variable)}"`);
  lines.push(`severity = "${escapeTomlString(issue.severity)}"`);
  lines.push(`type = "${escapeTomlString(issue.type)}"`);
  lines.push(`message = "${escapeTomlString(issue.message)}"`);
  if (issue.locations && issue.locations.length > 0) {
    lines.push(`locations = [${formatLocations(issue)}]`);
  } else {
    lines.push(`locations = []`);
  }
  return lines.join("\n");
}

export function formatToml(report: Report): string {
  const lines: string[] = [];
  lines.push(`[summary]`);
  lines.push(`total = ${report.summary.total}`);
  lines.push(`errors = ${report.summary.errors}`);
  lines.push(`warnings = ${report.summary.warnings}`);
  lines.push(`infos = ${report.summary.infos}`);
  lines.push("");
  if (report.issues.length === 0) {
    lines.push(`# No issues found`);
  } else {
    report.issues.forEach((issue, i) => {
      lines.push(formatIssueToml(issue, i));
      lines.push("");
    });
  }
  return lines.join("\n").trimEnd() + "\n";
}
