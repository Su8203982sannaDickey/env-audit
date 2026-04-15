import { Report, Issue } from "./types";

export interface IgnoreRule {
  variable: string;
  reason?: string;
}

export interface IgnoreConfig {
  rules: IgnoreRule[];
}

export function applyIgnoreRules(report: Report, config: IgnoreConfig): Report {
  const ignoredVars = new Set(config.rules.map((r) => r.variable));
  const filteredIssues = report.issues.filter(
    (issue) => !ignoredVars.has(issue.variable)
  );
  return { ...report, issues: filteredIssues };
}

export function formatIgnoredList(config: IgnoreConfig): string {
  if (config.rules.length === 0) {
    return "No variables are currently ignored.\n";
  }
  const lines: string[] = ["Ignored Variables:", "-".repeat(40)];
  for (const rule of config.rules) {
    const reason = rule.reason ? ` — ${rule.reason}` : "";
    lines.push(`  • ${rule.variable}${reason}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function formatIgnore(report: Report, config: IgnoreConfig): string {
  const filtered = applyIgnoreRules(report, config);
  const ignoredCount = report.issues.length - filtered.issues.length;
  const lines: string[] = [];
  lines.push(formatIgnoredList(config));
  lines.push(`Issues after applying ignore rules: ${filtered.issues.length}`);
  lines.push(`Issues suppressed: ${ignoredCount}`);
  lines.push("");
  return lines.join("\n");
}
