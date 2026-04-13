import { Report, Issue } from "./types";

function severityPrefix(severity: Issue["severity"]): string {
  switch (severity) {
    case "error": return "error";
    case "warning": return "warning";
    case "info": return "info";
    default: return "info";
  }
}

function formatIssueFrame(issue: Issue): string {
  const lines: string[] = [];
  const prefix = severityPrefix(issue.severity);

  lines.push(`${prefix}: ${issue.message}`);
  lines.push(`  variable: ${issue.variable}`);

  if (issue.locations && issue.locations.length > 0) {
    for (const loc of issue.locations) {
      const position = loc.line != null ? `:${loc.line}` : "";
      lines.push(`  --> ${loc.file}${position}`);
      if (loc.line != null) {
        lines.push(`   |`);
        lines.push(`${String(loc.line).padStart(3)} | (source not available)`);
        lines.push(`   |`);
      }
    }
  }

  return lines.join("\n");
}

export function formatCodeframe(report: Report): string {
  const sections: string[] = [];

  sections.push(`# env-audit codeframe report`);
  sections.push(
    `# ${report.summary.totalIssues} issue(s): ` +
    `${report.summary.errorCount} error(s), ` +
    `${report.summary.warningCount} warning(s), ` +
    `${report.summary.infoCount} info(s)`
  );
  sections.push("");

  if (report.issues.length === 0) {
    sections.push("No issues found.");
  } else {
    for (const issue of report.issues) {
      sections.push(formatIssueFrame(issue));
      sections.push("");
    }
  }

  return sections.join("\n");
}
