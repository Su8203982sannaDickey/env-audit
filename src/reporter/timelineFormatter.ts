import { Report, Issue } from "./types";

type TimelineEntry = {
  severity: string;
  type: string;
  variable: string;
  timestamp: string;
  locations: string[];
};

function issueToTimelineEntry(issue: Issue, index: number): TimelineEntry {
  const locations = (issue.locations ?? []).map(
    (loc) => `${loc.file}:${loc.line}`
  );
  // Simulate a deterministic pseudo-timestamp based on index for reproducibility
  const base = new Date(0);
  base.setSeconds(index);
  return {
    severity: issue.severity,
    type: issue.type,
    variable: issue.variable,
    timestamp: base.toISOString(),
    locations,
  };
}

function formatTimelineRow(entry: TimelineEntry, idx: number): string {
  const loc = entry.locations.length > 0 ? entry.locations.join(", ") : "n/a";
  return `  [${String(idx + 1).padStart(3, "0")}] ${entry.timestamp}  [${entry.severity.toUpperCase().padEnd(8)}] ${entry.type.padEnd(14)} ${entry.variable.padEnd(30)} @ ${loc}`;
}

export function formatTimeline(report: Report): string {
  const lines: string[] = [];
  lines.push("# Env Audit — Issue Timeline");
  lines.push(`# Generated: ${new Date(0).toISOString()}`);
  lines.push(`# Total issues: ${report.issues.length}`);
  lines.push("");
  lines.push(
    `  ${'#'.padStart(5)}  ${'Timestamp'.padEnd(24)}  ${'Severity'.padEnd(10)} ${'Type'.padEnd(14)} ${'Variable'.padEnd(30)}   Locations`
  );
  lines.push("  " + "-".repeat(110));

  report.issues.forEach((issue, idx) => {
    const entry = issueToTimelineEntry(issue, idx);
    lines.push(formatTimelineRow(entry, idx));
  });

  if (report.issues.length === 0) {
    lines.push("  (no issues found)");
  }

  lines.push("");
  lines.push(`# Summary: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warning(s), ${report.summary.infoCount} info(s)`);
  return lines.join("\n");
}
