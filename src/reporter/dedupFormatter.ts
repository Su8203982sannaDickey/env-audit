import { Report, Issue } from "./types";

/**
 * Generates a fingerprint key for an issue used for deduplication.
 */
export function issueFingerprint(issue: Issue): string {
  const locations = issue.locations
    ? issue.locations.map((l) => `${l.file}:${l.line ?? 0}`).sort().join(",")
    : "";
  return `${issue.type}::${issue.variable}::${issue.severity}::${locations}`;
}

/**
 * Deduplicates issues in a report, merging duplicate entries.
 * Returns a new report with unique issues only.
 */
export function deduplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Map<string, Issue>();
  for (const issue of issues) {
    const key = issueFingerprint(issue);
    if (!seen.has(key)) {
      seen.set(key, issue);
    }
  }
  return Array.from(seen.values());
}

/**
 * Formats a deduplication report showing original vs deduplicated counts.
 */
export function formatDedup(report: Report): string {
  const original = report.issues.length;
  const deduped = deduplicateIssues(report.issues);
  const removed = original - deduped.length;

  const lines: string[] = [];
  lines.push("=== Deduplication Report ===");
  lines.push(`Total issues (original) : ${original}`);
  lines.push(`Total issues (deduped)  : ${deduped.length}`);
  lines.push(`Duplicates removed      : ${removed}`);

  if (removed > 0) {
    lines.push("");
    lines.push("Unique issues:");
    for (const issue of deduped) {
      const loc =
        issue.locations && issue.locations.length > 0
          ? ` (${issue.locations[0].file}${
              issue.locations[0].line != null
                ? `:${issue.locations[0].line}`
                : ""
            })`
          : "";
      lines.push(
        `  [${issue.severity.toUpperCase()}] ${issue.type} — ${issue.variable}${loc}`
      );
    }
  } else {
    lines.push("");
    lines.push("No duplicates found.");
  }

  return lines.join("\n");
}
