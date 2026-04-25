import { Report, Issue } from "./types";

export type SortField = "severity" | "type" | "variable" | "file";
export type SortOrder = "asc" | "desc";

const SEVERITY_RANK: Record<string, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

function severityRank(issue: Issue): number {
  return SEVERITY_RANK[issue.severity] ?? 99;
}

function primaryLocation(issue: Issue): string {
  return issue.locations?.[0]?.file ?? "";
}

function compareIssues(
  a: Issue,
  b: Issue,
  field: SortField,
  order: SortOrder
): number {
  let result = 0;

  switch (field) {
    case "severity":
      result = severityRank(a) - severityRank(b);
      break;
    case "type":
      result = a.type.localeCompare(b.type);
      break;
    case "variable":
      result = a.variable.localeCompare(b.variable);
      break;
    case "file":
      result = primaryLocation(a).localeCompare(primaryLocation(b));
      break;
  }

  return order === "desc" ? -result : result;
}

export function sortIssues(
  issues: Issue[],
  field: SortField = "severity",
  order: SortOrder = "asc"
): Issue[] {
  return [...issues].sort((a, b) => compareIssues(a, b, field, order));
}

export function formatSort(
  report: Report,
  field: SortField = "severity",
  order: SortOrder = "asc"
): Report {
  const sorted = sortIssues(report.issues, field, order);
  return { ...report, issues: sorted };
}
