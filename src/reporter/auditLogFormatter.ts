import { Report, Issue } from "./types";

export interface AuditLogEntry {
  timestamp: string;
  runId: string;
  totalIssues: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  topFiles: Array<{ file: string; count: number }>;
}

function countBy<K extends keyof Issue>(
  issues: Issue[],
  key: K
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const issue of issues) {
    const val = String(issue[key]);
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return counts;
}

function topFiles(
  issues: Issue[],
  limit = 5
): Array<{ file: string; count: number }> {
  const fileCounts: Record<string, number> = {};
  for (const issue of issues) {
    for (const loc of issue.locations ?? []) {
      fileCounts[loc.file] = (fileCounts[loc.file] ?? 0) + 1;
    }
  }
  return Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([file, count]) => ({ file, count }));
}

export function buildAuditLogEntry(
  report: Report,
  runId: string,
  timestamp?: string
): AuditLogEntry {
  return {
    timestamp: timestamp ?? new Date().toISOString(),
    runId,
    totalIssues: report.issues.length,
    bySeverity: countBy(report.issues, "severity"),
    byType: countBy(report.issues, "type"),
    topFiles: topFiles(report.issues),
  };
}

export function formatAuditLog(report: Report, runId: string): string {
  const entry = buildAuditLogEntry(report, runId);
  const lines: string[] = [
    `[audit-log] run=${entry.runId} timestamp=${entry.timestamp}`,
    `  total=${entry.totalIssues}`,
    `  severity: ${Object.entries(entry.bySeverity)
      .map(([k, v]) => `${k}=${v}`)
      .join(" ")}`,
    `  type: ${Object.entries(entry.byType)
      .map(([k, v]) => `${k}=${v}`)
      .join(" ")}`,
  ];
  if (entry.topFiles.length > 0) {
    lines.push(
      `  top-files: ${entry.topFiles.map((f) => `${f.file}(${f.count})`).join(", ")}`
    );
  }
  return lines.join("\n");
}
