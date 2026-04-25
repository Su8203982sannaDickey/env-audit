import { AuditReport, Issue } from "./types";

export interface TruncateOptions {
  maxIssues?: number;
  maxLocations?: number;
  maxVariableLength?: number;
  ellipsis?: string;
}

const DEFAULT_OPTIONS: Required<TruncateOptions> = {
  maxIssues: 50,
  maxLocations: 5,
  maxVariableLength: 64,
  ellipsis: "...",
};

export function truncateString(value: string, max: number, ellipsis: string): string {
  if (value.length <= max) return value;
  return value.slice(0, max - ellipsis.length) + ellipsis;
}

export function truncateIssue(issue: Issue, opts: Required<TruncateOptions>): Issue {
  const truncatedVariable = truncateString(issue.variable, opts.maxVariableLength, opts.ellipsis);
  const truncatedLocations =
    issue.locations.length > opts.maxLocations
      ? [
          ...issue.locations.slice(0, opts.maxLocations),
          {
            file: opts.ellipsis,
            line: 0,
          },
        ]
      : issue.locations;

  return {
    ...issue,
    variable: truncatedVariable,
    locations: truncatedLocations,
  };
}

export function applyTruncation(report: AuditReport, options: TruncateOptions = {}): AuditReport {
  const opts: Required<TruncateOptions> = { ...DEFAULT_OPTIONS, ...options };

  const truncatedIssues = report.issues
    .slice(0, opts.maxIssues)
    .map((issue) => truncateIssue(issue, opts));

  const wasTruncated = report.issues.length > opts.maxIssues;

  return {
    ...report,
    issues: truncatedIssues,
    summary: {
      ...report.summary,
      notes: wasTruncated
        ? `Output truncated: showing ${opts.maxIssues} of ${report.issues.length} issues.`
        : report.summary.notes,
    },
  };
}

export function formatTruncate(report: AuditReport, options: TruncateOptions = {}): string {
  const truncated = applyTruncation(report, options);
  const lines: string[] = [];

  if (truncated.summary.notes) {
    lines.push(`[truncate] ${truncated.summary.notes}`);
  }

  for (const issue of truncated.issues) {
    const locs = issue.locations
      .map((l) => (l.file === "..." ? "..." : `${l.file}:${l.line}`))
      .join(", ");
    lines.push(`[${issue.severity}] ${issue.variable} (${issue.type}) @ ${locs}`);
  }

  return lines.join("\n");
}
