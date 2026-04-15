import { Report, Issue } from "./types";

interface WatchSnapshot {
  timestamp: string;
  totalIssues: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  newIssues: string[];
  resolvedIssues: string[];
}

function fingerprintIssue(issue: Issue): string {
  return `${issue.type}:${issue.variable}:${issue.severity}`;
}

function diffSnapshots(
  previous: Set<string>,
  current: Set<string>
): { added: string[]; removed: string[] } {
  const added = [...current].filter((k) => !previous.has(k));
  const removed = [...previous].filter((k) => !current.has(k));
  return { added, removed };
}

function buildSnapshot(
  report: Report,
  previous?: Set<string>
): WatchSnapshot {
  const current = new Set(report.issues.map(fingerprintIssue));
  const { added, removed } = previous
    ? diffSnapshots(previous, current)
    : { added: [], removed: [] };

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  for (const issue of report.issues) {
    byType[issue.type] = (byType[issue.type] ?? 0) + 1;
    bySeverity[issue.severity] = (bySeverity[issue.severity] ?? 0) + 1;
  }

  return {
    timestamp: new Date().toISOString(),
    totalIssues: report.issues.length,
    byType,
    bySeverity,
    newIssues: added,
    resolvedIssues: removed,
  };
}

export function formatWatch(
  report: Report,
  previousFingerprints?: Set<string>
): string {
  const snap = buildSnapshot(report, previousFingerprints);
  const lines: string[] = [];

  lines.push(`[Watch] ${snap.timestamp}`);
  lines.push(`Total issues: ${snap.totalIssues}`);

  lines.push("By type:");
  for (const [type, count] of Object.entries(snap.byType)) {
    lines.push(`  ${type}: ${count}`);
  }

  lines.push("By severity:");
  for (const [sev, count] of Object.entries(snap.bySeverity)) {
    lines.push(`  ${sev}: ${count}`);
  }

  if (snap.newIssues.length > 0) {
    lines.push(`New issues (+${snap.newIssues.length}):`);
    snap.newIssues.forEach((k) => lines.push(`  + ${k}`));
  }

  if (snap.resolvedIssues.length > 0) {
    lines.push(`Resolved issues (-${snap.resolvedIssues.length}):`);
    snap.resolvedIssues.forEach((k) => lines.push(`  - ${k}`));
  }

  return lines.join("\n");
}

export { buildSnapshot, fingerprintIssue, WatchSnapshot };
