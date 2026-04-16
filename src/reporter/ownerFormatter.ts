import { Report, Issue } from './types';

export interface OwnerRule {
  pattern: string;
  owner: string;
}

export function matchOwner(variable: string, rules: OwnerRule[]): string {
  for (const rule of rules) {
    const regex = new RegExp(rule.pattern);
    if (regex.test(variable)) return rule.owner;
  }
  return 'unowned';
}

export function groupByOwner(
  issues: Issue[],
  rules: OwnerRule[]
): Map<string, Issue[]> {
  const map = new Map<string, Issue[]>();
  for (const issue of issues) {
    const owner = matchOwner(issue.variable, rules);
    if (!map.has(owner)) map.set(owner, []);
    map.get(owner)!.push(issue);
  }
  return map;
}

export function formatOwner(report: Report, rules: OwnerRule[] = []): string {
  const groups = groupByOwner(report.issues, rules);
  const lines: string[] = ['# Ownership Report', ''];

  for (const [owner, issues] of groups.entries()) {
    lines.push(`## ${owner} (${issues.length} issue${issues.length !== 1 ? 's' : ''})`);
    for (const issue of issues) {
      const locs = issue.locations?.map(l => `${l.file}:${l.line}`).join(', ') ?? 'n/a';
      lines.push(`  [${issue.severity.toUpperCase()}] ${issue.variable} — ${issue.message} (${locs})`);
    }
    lines.push('');
  }

  lines.push(`Total issues: ${report.summary.totalIssues}`);
  return lines.join('\n');
}
