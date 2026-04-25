import { Report, Issue } from "./types";

const DEFAULT_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

export function shouldRedact(
  variableName: string,
  patterns: RegExp[] = DEFAULT_PATTERNS
): boolean {
  return patterns.some((p) => p.test(variableName));
}

export function redactIssue(
  issue: Issue,
  patterns: RegExp[] = DEFAULT_PATTERNS
): Issue {
  if (!shouldRedact(issue.variable, patterns)) return issue;
  return {
    ...issue,
    variable: issue.variable,
    message: issue.message.replace(
      /`([^`]+)`/g,
      (match, val) => (shouldRedact(val, patterns) ? "`[REDACTED]`" : match)
    ),
  };
}

export function formatRedact(
  report: Report,
  patterns: RegExp[] = DEFAULT_PATTERNS
): string {
  const redacted = report.issues.map((i) => redactIssue(i, patterns));
  const lines: string[] = [
    "# Redacted Audit Report",
    `Generated: ${new Date().toISOString()}`,
    `Total issues: ${redacted.length}`,
    "",
  ];

  for (const issue of redacted) {
    const varDisplay = shouldRedact(issue.variable, patterns)
      ? "[REDACTED]"
      : issue.variable;
    lines.push(
      `[${issue.severity.toUpperCase()}] ${issue.type} — ${varDisplay}`
    );
    lines.push(`  ${issue.message}`);
    if (issue.locations && issue.locations.length > 0) {
      for (const loc of issue.locations) {
        lines.push(`  at ${loc.file}:${loc.line}`);
      }
    }
    lines.push("");
  }

  lines.push(
    `Summary: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s), ${report.summary.infos} info(s)`
  );

  return lines.join("\n");
}
