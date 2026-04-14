import { Report, Issue } from "./types";

/**
 * Formats a report as a Glean-compatible NDJSON (newline-delimited JSON)
 * where each line is a self-contained JSON object representing one issue.
 */

function severityToGlean(severity: string): string {
  switch (severity) {
    case "error":
      return "ERROR";
    case "warning":
      return "WARNING";
    default:
      return "INFO";
  }
}

function issueToGleanRecord(
  issue: Issue,
  index: number
): Record<string, unknown> {
  const locations = issue.locations ?? [];
  return {
    id: index + 1,
    variable: issue.variable,
    type: issue.type,
    severity: severityToGlean(issue.severity),
    message: issue.message,
    locations: locations.map((loc) => ({
      file: loc.file,
      line: loc.line ?? null,
    })),
    timestamp: new Date().toISOString(),
  };
}

export function formatGlean(report: Report): string {
  if (report.issues.length === 0) {
    return JSON.stringify({
      id: 0,
      summary: "no issues found",
      total: 0,
      timestamp: new Date().toISOString(),
    });
  }

  const lines = report.issues.map((issue, i) =>
    JSON.stringify(issueToGleanRecord(issue, i))
  );

  const summary = JSON.stringify({
    id: report.issues.length + 1,
    summary: report.summary,
    total: report.issues.length,
    timestamp: new Date().toISOString(),
  });

  return [...lines, summary].join("\n");
}
