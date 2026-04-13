import { Report, Issue } from "./types";

function severityComment(severity: Issue["severity"]): string {
  switch (severity) {
    case "error": return "# [ERROR]";
    case "warning": return "# [WARNING]";
    case "info": return "# [INFO]";
    default: return "#";
  }
}

function formatIssueBlock(issue: Issue): string {
  const lines: string[] = [];
  lines.push(`${severityComment(issue.severity)} type=${issue.type}`);
  lines.push(`# ${issue.message}`);
  if (issue.locations && issue.locations.length > 0) {
    const locs = issue.locations.map((l) => `${l.file}${l.line != null ? `:${l.line}` : ""}`).join(", ");
    lines.push(`# locations: ${locs}`);
  }
  lines.push(`${issue.variable}=`);
  return lines.join("\n");
}

export function formatDotenv(report: Report): string {
  const { summary, issues } = report;

  const header = [
    `# env-audit report`,
    `# total=${summary.total} missing=${summary.missing} duplicate=${summary.duplicate} undocumented=${summary.undocumented}`,
    ``,
  ].join("\n");

  if (issues.length === 0) {
    return header + `# No issues found.\n`;
  }

  const blocks = issues.map(formatIssueBlock).join("\n\n");
  return header + blocks + "\n";
}
