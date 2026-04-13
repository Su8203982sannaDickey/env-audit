import { Report, Issue } from "./types";

function severitySymbol(severity: string): string {
  switch (severity) {
    case "error": return "✖";
    case "warning": return "⚠";
    case "info": return "ℹ";
    default: return "·";
  }
}

function formatIssueLine(issue: Issue): string {
  const sym = severitySymbol(issue.severity);
  const loc =
    issue.locations && issue.locations.length > 0
      ? issue.locations.map((l) => `${l.file}:${l.line ?? 0}`).join(", ")
      : "(no location)";
  return `${sym} [${issue.severity.toUpperCase()}] ${issue.variable} — ${issue.message} (${loc})`;
}

export function formatCompact(report: Report): string {
  if (report.issues.length === 0) {
    return `✔ No issues found. (${report.summary.totalVariables} variables scanned)\n`;
  }

  const lines: string[] = [];
  lines.push(`env-audit compact report — ${new Date(report.generatedAt).toISOString()}`);
  lines.push(`Scanned: ${report.scannedDir}`);
  lines.push("");

  for (const issue of report.issues) {
    lines.push(formatIssueLine(issue));
  }

  lines.push("");
  lines.push(
    `Total: ${report.summary.totalIssues} issue(s) | ` +
    `errors: ${report.summary.errors} | ` +
    `warnings: ${report.summary.warnings} | ` +
    `info: ${report.summary.infos}`
  );

  return lines.join("\n") + "\n";
}
