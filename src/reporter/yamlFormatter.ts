import { Report, Issue } from "./types";

function indentLines(text: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n");
}

function escapeYamlString(value: string): string {
  if (/[:\[\]{}#&*!|>'"%@`,]/.test(value) || value.includes("\n")) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function formatIssueYaml(issue: Issue): string {
  const lines: string[] = [
    `  - type: ${escapeYamlString(issue.type)}`,
    `    severity: ${escapeYamlString(issue.severity)}`,
    `    variable: ${escapeYamlString(issue.variable)}`,
    `    message: ${escapeYamlString(issue.message)}`,
  ];

  if (issue.locations && issue.locations.length > 0) {
    lines.push("    locations:");
    for (const loc of issue.locations) {
      const line = loc.line !== undefined ? `:${loc.line}` : "";
      lines.push(`      - ${escapeYamlString(loc.file + line)}`);
    }
  } else {
    lines.push("    locations: []");
  }

  return lines.join("\n");
}

export function formatYaml(report: Report): string {
  const { summary, issues } = report;

  const summaryBlock = [
    "summary:",
    `  total: ${summary.total}`,
    `  errors: ${summary.errors}`,
    `  warnings: ${summary.warnings}`,
    `  info: ${summary.info}`,
  ].join("\n");

  const issuesBlock =
    issues.length === 0
      ? "issues: []"
      : `issues:\n${issues.map(formatIssueYaml).join("\n")}`;

  return `${summaryBlock}\n${issuesBlock}\n`;
}
