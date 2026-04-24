import { Report, Issue } from "./types";

export interface FilterOptions {
  severity?: string[];
  type?: string[];
  file?: string;
  variable?: string;
}

function matchesSeverity(issue: Issue, severities: string[]): boolean {
  return severities.map((s) => s.toLowerCase()).includes(issue.severity.toLowerCase());
}

function matchesType(issue: Issue, types: string[]): boolean {
  return types.map((t) => t.toLowerCase()).includes(issue.type.toLowerCase());
}

function matchesFile(issue: Issue, pattern: string): boolean {
  const locations = issue.locations ?? [];
  return locations.some((loc) => loc.file.includes(pattern));
}

function matchesVariable(issue: Issue, pattern: string): boolean {
  return issue.variable.toLowerCase().includes(pattern.toLowerCase());
}

export function applyFilters(issues: Issue[], opts: FilterOptions): Issue[] {
  return issues.filter((issue) => {
    if (opts.severity && opts.severity.length > 0) {
      if (!matchesSeverity(issue, opts.severity)) return false;
    }
    if (opts.type && opts.type.length > 0) {
      if (!matchesType(issue, opts.type)) return false;
    }
    if (opts.file) {
      if (!matchesFile(issue, opts.file)) return false;
    }
    if (opts.variable) {
      if (!matchesVariable(issue, opts.variable)) return false;
    }
    return true;
  });
}

export function formatFilter(report: Report, opts: FilterOptions): string {
  const filtered = applyFilters(report.issues, opts);
  const activeFilters: string[] = [];

  if (opts.severity?.length) activeFilters.push(`severity=${opts.severity.join(",")}`);
  if (opts.type?.length) activeFilters.push(`type=${opts.type.join(",")}`);
  if (opts.file) activeFilters.push(`file=${opts.file}`);
  if (opts.variable) activeFilters.push(`variable=${opts.variable}`);

  const header = activeFilters.length
    ? `# Filtered Results [${activeFilters.join(" | ")}]`
    : `# Filtered Results [no filters]`;

  if (filtered.length === 0) {
    return `${header}\n\nNo issues match the specified filters.\n`;
  }

  const lines = filtered.map((issue) => {
    const locs =
      issue.locations?.map((l) => `${l.file}:${l.line}`).join(", ") ?? "unknown";
    return `[${issue.severity.toUpperCase()}] ${issue.variable} (${issue.type}) — ${locs}`;
  });

  return `${header}\n\n${lines.join("\n")}\n\nTotal: ${filtered.length} issue(s)\n`;
}
