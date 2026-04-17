import type { Report } from './types';

export interface SnapshotEntry {
  variable: string;
  issueType: string;
  severity: string;
  locations: string[];
  capturedAt: string;
}

export interface Snapshot {
  version: number;
  capturedAt: string;
  totalIssues: number;
  entries: SnapshotEntry[];
}

export function buildSnapshotEntry(issue: Report['issues'][number], capturedAt: string): SnapshotEntry {
  return {
    variable: issue.variable,
    issueType: issue.type,
    severity: issue.severity,
    locations: (issue.locations ?? []).map(l => `${l.file}:${l.line ?? 0}`),
    capturedAt,
  };
}

export function formatSnapshot(report: Report): string {
  const now = new Date().toISOString();
  const snapshot: Snapshot = {
    version: 1,
    capturedAt: now,
    totalIssues: report.issues.length,
    entries: report.issues.map(i => buildSnapshotEntry(i, now)),
  };
  return JSON.stringify(snapshot, null, 2);
}
