import { Report, Issue } from "./types";

interface NdjsonIssueRecord {
  type: string;
  severity: string;
  variable: string;
  message: string;
  locations: Array<{ file: string; line?: number }>;
}

interface NdjsonSummaryRecord {
  type: "summary";
  totalIssues: number;
  errors: number;
  warnings: number;
  info: number;
  scannedFiles: number;
  envFiles: number;
}

function issueToNdjsonRecord(issue: Issue): NdjsonIssueRecord {
  return {
    type: "issue",
    severity: issue.severity,
    variable: issue.variable,
    message: issue.message,
    locations: (issue.locations ?? []).map((loc) => ({
      file: loc.file,
      ...(loc.line !== undefined ? { line: loc.line } : {}),
    })),
  };
}

function buildSummaryRecord(report: Report): NdjsonSummaryRecord {
  return {
    type: "summary",
    totalIssues: report.summary.totalIssues,
    errors: report.summary.errors,
    warnings: report.summary.warnings,
    info: report.summary.info,
    scannedFiles: report.summary.scannedFiles,
    envFiles: report.summary.envFiles,
  };
}

export function formatNdjson(report: Report): string {
  const lines: string[] = [];

  lines.push(JSON.stringify(buildSummaryRecord(report)));

  for (const issue of report.issues) {
    lines.push(JSON.stringify(issueToNdjsonRecord(issue)));
  }

  return lines.join("\n") + "\n";
}
