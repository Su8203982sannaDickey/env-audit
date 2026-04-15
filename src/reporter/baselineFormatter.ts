import { Report, Issue } from "./types";

export interface BaselineEntry {
  variable: string;
  type: string;
  severity: string;
  fingerprint: string;
}

export interface BaselineFile {
  version: number;
  generatedAt: string;
  entries: BaselineEntry[];
}

function fingerprint(issue: Issue): string {
  const loc =
    issue.locations && issue.locations.length > 0
      ? `${issue.locations[0].file}:${issue.locations[0].line ?? 0}`
      : "unknown";
  return Buffer.from(`${issue.variable}|${issue.type}|${loc}`)
    .toString("base64")
    .slice(0, 24);
}

export function buildBaseline(report: Report): BaselineFile {
  const entries: BaselineEntry[] = report.issues.map((issue) => ({
    variable: issue.variable,
    type: issue.type,
    severity: issue.severity,
    fingerprint: fingerprint(issue),
  }));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries,
  };
}

export function applyBaseline(
  report: Report,
  baseline: BaselineFile
): Report {
  const knownFingerprints = new Set(
    baseline.entries.map((e) => e.fingerprint)
  );

  const newIssues = report.issues.filter(
    (issue) => !knownFingerprints.has(fingerprint(issue))
  );

  return { ...report, issues: newIssues };
}

export function formatBaseline(report: Report): string {
  const baseline = buildBaseline(report);
  return JSON.stringify(baseline, null, 2);
}
