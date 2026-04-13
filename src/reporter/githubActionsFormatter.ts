import { Report, Issue, Severity } from "./types";

/**
 * Maps severity to GitHub Actions annotation level.
 */
function severityToAnnotation(severity: Severity): string {
  switch (severity) {
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
    default:
      return "notice";
  }
}

/**
 * Formats a single issue as a GitHub Actions workflow command annotation.
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions
 */
function formatAnnotation(issue: Issue): string {
  const level = severityToAnnotation(issue.severity);
  const lines: string[] = [];

  if (issue.locations && issue.locations.length > 0) {
    for (const loc of issue.locations) {
      const filePart = `file=${loc.file}`;
      const linePart = loc.line !== undefined ? `,line=${loc.line}` : "";
      const title = encodeURIComponent(issue.rule);
      lines.push(
        `::${level} ${filePart}${linePart},title=${title}::${issue.message}`
      );
    }
  } else {
    const title = encodeURIComponent(issue.rule);
    lines.push(`::${level} title=${title}::${issue.message}`);
  }

  return lines.join("\n");
}

/**
 * Formats the full report as GitHub Actions annotation commands.
 */
export function formatGithubActions(report: Report): string {
  const parts: string[] = [];

  parts.push(`::group::env-audit results (${report.summary.totalIssues} issues)`);

  for (const issue of report.issues) {
    parts.push(formatAnnotation(issue));
  }

  parts.push("::endgroup::");

  return parts.join("\n");
}
