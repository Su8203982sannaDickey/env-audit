import { Report, Issue } from "./types";

export type SeverityLevel = "error" | "warning" | "info";

export interface SeverityFilterOptions {
  minSeverity?: SeverityLevel;
  only?: SeverityLevel[];
  exclude?: SeverityLevel[];
}

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  error: 3,
  warning: 2,
  info: 1,
};

export function normalizeSeverity(severity: string): SeverityLevel {
  const s = severity.toLowerCase();
  if (s === "error" || s === "warning" || s === "info") return s;
  return "info";
}

export function meetsMinSeverity(
  issue: Issue,
  min: SeverityLevel
): boolean {
  const rank = SEVERITY_RANK[normalizeSeverity(issue.severity)];
  return rank >= SEVERITY_RANK[min];
}

export function filterBySeverity(
  issues: Issue[],
  opts: SeverityFilterOptions
): Issue[] {
  return issues.filter((issue) => {
    const sev = normalizeSeverity(issue.severity);
    if (opts.only && opts.only.length > 0) {
      return opts.only.includes(sev);
    }
    if (opts.exclude && opts.exclude.includes(sev)) {
      return false;
    }
    if (opts.minSeverity) {
      return meetsMinSeverity(issue, opts.minSeverity);
    }
    return true;
  });
}

export function formatSeverityFilter(
  report: Report,
  opts: SeverityFilterOptions
): Report {
  const filtered = filterBySeverity(report.issues, opts);
  return {
    ...report,
    issues: filtered,
    summary: {
      ...report.summary,
      total: filtered.length,
    },
  };
}
